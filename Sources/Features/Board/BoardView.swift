import SwiftUI
import OpenFocusCore
import OpenFocusData

/// Kanban layout for the current selection: one column per `TaskStatus`, with
/// drag-and-drop between them.
///
/// Cards carry the task's `uuidString` as their drag payload rather than a custom
/// `Transferable` type — the board only ever needs to identify a row it already
/// has, and anything it can't resolve (foreign text, a stale id) is ignored.
struct BoardView: View {
    let tasks: [TodoTask]
    let onMove: (TodoTask, TaskStatus) -> Void

    private let columnWidth: CGFloat = 300

    var body: some View {
        ScrollView(.horizontal) {
            HStack(alignment: .top, spacing: AppTheme.Spacing.md) {
                ForEach(TaskStatus.allCases) { status in
                    BoardColumnView(
                        status: status,
                        tasks: tasks(in: status),
                        onMove: onMove,
                        taskForID: task(forID:)
                    )
                    .frame(width: columnWidth)
                }
            }
            .padding(.horizontal, AppTheme.Spacing.md)
            .padding(.vertical, AppTheme.Spacing.sm)
            .scrollTargetLayout()
        }
        .scrollTargetBehavior(.viewAligned)
    }

    /// Column contents. Done is ordered by most-recently completed; the working
    /// columns keep the shared list ordering so the board and list agree.
    private func tasks(in status: TaskStatus) -> [TodoTask] {
        let column = tasks.filter { $0.status == status }
        guard status == .done else { return column.sorted { $0.order < $1.order } }
        return column.sorted { ($0.completedAt ?? .distantPast) > ($1.completedAt ?? .distantPast) }
    }

    private func task(forID id: String) -> TodoTask? {
        guard let uuid = UUID(uuidString: id) else { return nil }
        return tasks.first { $0.id == uuid }
    }
}
