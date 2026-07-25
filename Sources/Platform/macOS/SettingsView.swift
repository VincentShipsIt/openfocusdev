import SwiftUI

/// macOS Settings window: appearance, the AI backend for "Plan my day", the
/// OpenRouter key, and the build number.
///
/// Chrome only — the form is shared with the iOS Settings sheet (`SettingsForm`),
/// so a section added there shows up on both platforms.
struct SettingsView: View {
    var body: some View {
        SettingsForm()
            .formStyle(.grouped)
            .padding(20)
            .frame(width: 480, height: 460)
    }
}
