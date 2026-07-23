import SwiftUI
import OpenCheckCore

/// macOS Settings: pick the AI backend for "Plan my day" — a local agent CLI
/// (no API key) or the OpenRouter fallback (API key stored in the Keychain).
struct SettingsView: View {
    @EnvironmentObject private var container: DependencyContainer
    @State private var backend: AIBackend = .openRouter
    @State private var availableBackends: [AIBackend] = AIBackend.allCases
    @State private var apiKey = ""
    @State private var saved = false

    var body: some View {
        Form {
            Section("AI backend") {
                Picker("Plan with", selection: $backend) {
                    ForEach(AIBackend.allCases) { option in
                        Text(label(for: option)).tag(option)
                    }
                }
                .onChange(of: backend) { _, newValue in
                    container.aiPreferences.backend = newValue
                }
                Text(backend.detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if noCLIInstalled {
                    Label(
                        "Install the Claude Code or Codex CLI to plan without an API key.",
                        systemImage: "terminal"
                    )
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
            }

            Section("OpenRouter API key") {
                SecureField("API key", text: $apiKey)
                Text("Only used by the “API key (OpenRouter)” backend. Stored in your Keychain.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
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
        .formStyle(.grouped)
        .padding(20)
        .frame(width: 480, height: 360)
        .onAppear {
            apiKey = container.keychain.aiAPIKey ?? ""
            backend = container.aiPreferences.backend
        }
        .task {
            // Detecting installed CLIs can spawn a login shell; keep it off the
            // first render.
            availableBackends = await Task.detached { AIBackend.available() }.value
        }
    }

    /// Annotate a CLI backend whose tool isn't installed; it stays selectable so
    /// the user gets an actionable error rather than a hidden option.
    private func label(for backend: AIBackend) -> String {
        if backend.cliAgent != nil, !availableBackends.contains(backend) {
            return "\(backend.label) (not installed)"
        }
        return backend.label
    }

    private var noCLIInstalled: Bool {
        !availableBackends.contains(.claudeCLI) && !availableBackends.contains(.codexCLI)
    }
}
