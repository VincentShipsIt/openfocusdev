import SwiftUI

/// The collapsed quick-add affordance: Todoist's floating "+" reimagined as a
/// labeled glass chip that sits above the tab bar. A single accent-tinted glass
/// capsule split into two zones — "Add task" opens the compose sheet (or the
/// macOS ⌘N shortcut), and the trailing ✨ triggers "Plan my day". Merging the
/// AI action in here is what clears the top of the list.
struct QuickAddChip: View {
    let addAction: () -> Void
    let planAction: () -> Void

    var body: some View {
        HStack(spacing: 0) {
            Button(action: addAction) {
                Label("Add task", systemImage: "plus")
                    .font(.headline)
                    .padding(.horizontal, AppTheme.Spacing.md)
                    .padding(.vertical, AppTheme.Spacing.sm)
            }
            .accessibilityLabel("Add task")

            Rectangle()
                .fill(.white.opacity(0.35))
                .frame(width: 1, height: 22)

            Button(action: planAction) {
                Image(systemName: "sparkles")
                    .font(.headline)
                    .padding(.horizontal, AppTheme.Spacing.md)
                    .padding(.vertical, AppTheme.Spacing.sm)
            }
            .accessibilityLabel("Plan my day")
        }
        .buttonStyle(.plain)
        .foregroundStyle(.white)
        .glassEffect(.regular.tint(.accentColor).interactive(), in: .capsule)
        .onReceive(NotificationCenter.default.publisher(for: .newTask)) { _ in
            addAction()
        }
    }
}
