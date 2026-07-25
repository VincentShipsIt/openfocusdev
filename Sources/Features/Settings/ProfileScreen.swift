import SwiftUI

/// The profile page, presented as a sheet from the avatar in Browse. iOS has no
/// Settings scene and no settings tab by design, so this is the single entry
/// point to everything configurable on that platform.
///
/// Chrome only: the form is shared with the macOS Settings window
/// (`SettingsForm`), which is what keeps the two platforms in step. Lives beside
/// that form rather than under `Platform/iOS` because `BrowseView` — its only
/// presenter — is compiled into both targets.
struct ProfileScreen: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            SettingsForm()
                .navigationTitle("Profile")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") { dismiss() }
                    }
                }
        }
    }
}
