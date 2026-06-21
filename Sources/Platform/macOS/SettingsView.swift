import SwiftUI

/// macOS Settings: the AI API key (stored in the Keychain) used by "Plan my day".
struct SettingsView: View {
    @EnvironmentObject private var container: DependencyContainer
    @State private var apiKey = ""
    @State private var saved = false

    var body: some View {
        Form {
            Section("AI") {
                SecureField("API key (OpenRouter)", text: $apiKey)
                Text("Stored in your Keychain. Used for natural-language refinement and \"Plan my day\".")
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
        .frame(width: 460, height: 220)
        .onAppear { apiKey = container.keychain.aiAPIKey ?? "" }
    }
}
