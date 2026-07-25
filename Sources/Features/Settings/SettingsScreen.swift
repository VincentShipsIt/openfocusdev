import SwiftUI

/// iOS Settings, presented as a sheet from the gear in Browse — iOS has no
/// Settings scene, so the app has to carry its own entry point.
///
/// Chrome only: the form is shared with the macOS Settings window
/// (`SettingsForm`), which is what keeps the two platforms in step. Lives beside
/// that form rather than under `Platform/iOS` because `BrowseView` — its only
/// presenter — is compiled into both targets.
struct SettingsScreen: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            SettingsForm()
                .navigationTitle("Settings")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") { dismiss() }
                    }
                }
        }
    }
}
