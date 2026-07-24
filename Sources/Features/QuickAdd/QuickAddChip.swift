import SwiftUI

/// The collapsed quick-add affordance: Todoist's floating "+" reimagined as a
/// labeled glass chip that sits above the tab bar. Small on purpose — it never
/// competes with the task list. Tapping it (or the macOS ⌘N shortcut) presents
/// the compose sheet, where the text is parsed on-device.
struct QuickAddChip: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label("Add task", systemImage: "plus")
                .font(.headline)
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.vertical, AppTheme.Spacing.sm)
        }
        .buttonStyle(.glassProminent)
        .tint(.accentColor)
        .onReceive(NotificationCenter.default.publisher(for: .newTask)) { _ in
            action()
        }
    }
}
