import SwiftUI

/// The compose surface the quick-add chip presents. On-device parsing turns
/// "report fri 5pm !!" into a dated, prioritized, labeled task on submit. The
/// field autofocuses so the keyboard is up the moment the sheet appears.
struct QuickAddSheet: View {
    @Binding var text: String
    @Binding var reminderEnabled: Bool
    /// Whether the parsed draft carries a due date. A reminder needs one, so the
    /// toggle only appears once the typed text resolves to a dated task.
    let reminderAvailable: Bool
    let onSubmit: () -> Void

    @FocusState private var focused: Bool
    @Environment(\.dismiss) private var dismiss

    private var isEmpty: Bool {
        text.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                TextField("Add a task…", text: $text, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.title3)
                    .focused($focused)
                    .onSubmit(submit)
                    .padding()

                if reminderAvailable {
                    Divider()
                    Toggle(isOn: $reminderEnabled) {
                        Label("Remind me", systemImage: "bell")
                    }
                    .padding()
                }
            }
            .frame(maxHeight: .infinity, alignment: .top)
            .navigationTitle("New task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add", action: submit).disabled(isEmpty)
                }
            }
        }
        .presentationDetents([.height(180), .medium])
        .onAppear { focused = true }
    }

    private func submit() {
        guard !isEmpty else { return }
        onSubmit()
        dismiss()
    }
}
