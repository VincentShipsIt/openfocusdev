import SwiftUI
import TodoData

struct NewProjectSheet: View {
    @Environment(ProjectService.self) private var projectService
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var colorHex = "#DC4C3E"

    private let palette = ["#DC4C3E", "#EB8909", "#F9C748", "#7ECC49", "#46A9FB", "#A970FF", "#E05194"]

    var body: some View {
        NavigationStack {
            Form {
                TextField("Project name", text: $name)

                Section("Color") {
                    HStack(spacing: AppTheme.Spacing.md) {
                        ForEach(palette, id: \.self) { hex in
                            Circle()
                                .fill(Color(hex: hex))
                                .frame(width: 26, height: 26)
                                .overlay {
                                    if hex == colorHex {
                                        Image(systemName: "checkmark")
                                            .font(.caption.bold())
                                            .foregroundStyle(.white)
                                    }
                                }
                                .onTapGesture { colorHex = hex }
                        }
                    }
                }
            }
            .formStyle(.grouped)
            .navigationTitle("New project")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add", action: add)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .frame(minWidth: 360, minHeight: 320)
    }

    private func add() {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        projectService.create(name: trimmed, colorHex: colorHex)
        dismiss()
    }
}
