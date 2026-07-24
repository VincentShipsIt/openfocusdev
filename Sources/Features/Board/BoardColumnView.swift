import SwiftUI
import OpenFocusCore
import OpenFocusData

/// One board column: a header over a scrolling stack of cards, acting as a drop
/// target for its own status. Columns are **content**, not navigation chrome, so
/// nothing here uses glass — the layout picker in the toolbar is the glass surface.
struct BoardColumnView: View {
    let status: TaskStatus
    let tasks: [TodoTask]
    let onMove: (TodoTask, TaskStatus) -> Void
    /// Resolves a dragged payload (a task's `uuidString`) back to a task.
    let taskForID: (String) -> TodoTask?

    @State private var isTargeted = false

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            header

            ScrollView {
                LazyVStack(spacing: AppTheme.Spacing.sm) {
                    if tasks.isEmpty {
                        Text("Nothing here")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppTheme.Spacing.lg)
                    } else {
                        ForEach(tasks) { task in
                            BoardCard(task: task) { onMove(task, $0) }
                                .draggable(task.id.uuidString)
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xs)
                .padding(.bottom, AppTheme.Spacing.sm)
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .frame(maxHeight: .infinity, alignment: .top)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .fill(.quaternary.opacity(isTargeted ? 0.45 : 0.15))
        )
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .strokeBorder(Color.accentColor, lineWidth: isTargeted ? 2 : 0)
        )
        .animation(.snappy(duration: 0.15), value: isTargeted)
        .dropDestination(for: String.self) { payloads, _ in
            // Foreign or unparseable drops are simply ignored.
            let moved = payloads.compactMap(taskForID)
            for task in moved { onMove(task, status) }
            return !moved.isEmpty
        } isTargeted: { isTargeted = $0 }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("\(status.label), \(tasks.count) tasks")
    }

    private var header: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Label(status.label, systemImage: status.symbol)
                .font(.subheadline.weight(.semibold))
                .labelStyle(.titleAndIcon)

            Spacer(minLength: 0)

            Text("\(tasks.count)")
                .font(.caption.monospacedDigit())
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, AppTheme.Spacing.sm)
        .padding(.top, AppTheme.Spacing.sm)
        .frame(maxWidth: .infinity)
        .accessibilityAddTraits(.isHeader)
    }
}
