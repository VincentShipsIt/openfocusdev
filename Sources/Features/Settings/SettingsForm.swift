import SwiftUI
import OpenFocusCore
import OpenFocusData

/// The settings form itself, shared by the macOS Settings scene and the iOS
/// Settings sheet so the two can't drift. Platform chrome — window sizing, the
/// navigation bar, the Done button — belongs to whoever presents it.
struct SettingsForm: View {
    @EnvironmentObject private var container: DependencyContainer
    @AppStorage(AppearanceMode.storageKey) private var appearance: AppearanceMode = .defaultMode
    @State private var backend: AIBackend = .defaultBackend
    @State private var availableBackends: [AIBackend] = AIBackend.allCases
    @State private var apiKey = ""
    @State private var saved = false

    /// What this platform can actually run. iOS has no shell, so the CLI backends
    /// are never offered there (issue #10) — same constant the routing preference
    /// resolves against, so Settings and the client agree.
    private let allowsLocalShell = AIPreferences.platformAllowsLocalShell

    private var offeredBackends: [AIBackend] {
        AIBackend.offered(allowsLocalShell: allowsLocalShell)
    }

    var body: some View {
        Form {
            appearanceSection
            notificationSection
            backendSection
            apiKeySection
            aboutSection
        }
        .onAppear {
            apiKey = container.keychain.aiAPIKey ?? ""
            backend = AIBackend.resolved(
                container.aiPreferences.backend,
                allowsLocalShell: allowsLocalShell
            )
        }
        .task {
            // The status can change while the app is backgrounded, so read it on
            // every presentation rather than trusting the last value.
            await container.reminderService.refreshAuthorizationStatus()

            // Detecting installed CLIs can spawn a login shell; keep it off the
            // first render, and skip it entirely where CLIs can't run.
            guard allowsLocalShell else { return }
            availableBackends = await Task.detached { AIBackend.available() }.value
        }
    }

    // MARK: - Appearance

    private var appearanceSection: some View {
        Section("Appearance") {
            Picker("Theme", selection: $appearance) {
                ForEach(AppearanceMode.allCases) { mode in
                    Label(mode.title, systemImage: mode.symbol).tag(mode)
                }
            }
            caption("System follows your device's light/dark setting.")
        }
    }

    // MARK: - Notifications

    /// Reminders can only fire with notification permission, and nothing else in the
    /// app says whether it was granted — a reminder that silently never arrives is
    /// indistinguishable from a bug. So Settings states the status plainly.
    @ViewBuilder
    private var notificationSection: some View {
        let status = container.reminderService.authorizationStatus

        Section("Reminders") {
            LabeledContent("Notifications", value: title(for: status))

            switch status {
            case .notDetermined:
                // Nothing to change in system Settings yet — the app doesn't appear
                // in that list until it has asked once. So ask from here.
                Button("Allow notifications") {
                    Task { await container.reminderService.requestAuthorization() }
                }
                caption("Due-date reminders need permission before they can be delivered.")
            case .denied:
                caption(
                    "Reminders are off. Turn notifications on for OpenFocus in your "
                        + "system settings to get them back."
                )
            case .authorized, .provisional, .ephemeral:
                caption("Tasks with a due date and a reminder will notify you when they're due.")
            }

            if let message = container.reminderService.lastErrorMessage {
                Label(message, systemImage: "exclamationmark.triangle")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
    }

    private func title(for status: ReminderAuthorizationStatus) -> String {
        switch status {
        case .notDetermined: return "Not asked yet"
        case .denied: return "Off"
        case .authorized: return "On"
        case .provisional: return "Quiet delivery"
        case .ephemeral: return "On (temporary)"
        }
    }

    // MARK: - AI

    @ViewBuilder
    private var backendSection: some View {
        Section("AI backend") {
            // One offered backend is a statement, not a choice — show it as a value
            // rather than a picker with nothing to pick.
            if offeredBackends.count > 1 {
                Picker("Plan with", selection: $backend) {
                    ForEach(offeredBackends) { option in
                        Text(label(for: option)).tag(option)
                    }
                }
                .onChange(of: backend) { _, newValue in
                    container.aiPreferences.backend = newValue
                }
            } else {
                LabeledContent("Plan with", value: backend.label)
            }

            caption(backend.detail)

            if allowsLocalShell, noCLIInstalled {
                Label(
                    "The CLI backends are optional — install the Claude Code or Codex CLI "
                        + "to plan without an API key.",
                    systemImage: "terminal"
                )
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
    }

    private var apiKeySection: some View {
        Section("OpenRouter API key") {
            // Secure entry already opts out of autocorrect and autocapitalization on
            // iOS, so the key doesn't need either spelled out here.
            SecureField("API key", text: $apiKey)
                .onChange(of: apiKey) { _, _ in saved = false }
            caption("Used by the “OpenRouter (API key)” backend. Stored in your Keychain.")
            HStack {
                Button("Save") {
                    container.keychain.setAIAPIKey(apiKey)
                    saved = true
                }
                if saved {
                    Label("Saved", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(.green)
                }
            }
        }
    }

    // MARK: - About

    private var aboutSection: some View {
        Section("About") {
            LabeledContent("Version", value: Self.versionString)
            caption("Tasks live on this device only — nothing is uploaded.")
        }
    }

    /// Marketing version and build, straight from the bundle so it can't fall out of
    /// step with what shipped.
    private static var versionString: String {
        let info = Bundle.main.infoDictionary
        let version = info?["CFBundleShortVersionString"] as? String ?? "—"
        let build = info?["CFBundleVersion"] as? String ?? "—"
        return "\(version) (\(build))"
    }

    // MARK: - Helpers

    private func caption(_ text: String) -> some View {
        Text(text)
            .font(.caption)
            .foregroundStyle(.secondary)
    }

    /// Annotate a CLI backend whose tool isn't installed; it stays selectable so the
    /// user gets an actionable error rather than a silently missing option.
    private func label(for backend: AIBackend) -> String {
        if backend.requiresLocalShell, !availableBackends.contains(backend) {
            return "\(backend.label) (not installed)"
        }
        return backend.label
    }

    private var noCLIInstalled: Bool {
        !availableBackends.contains(.claudeCLI) && !availableBackends.contains(.codexCLI)
    }
}
