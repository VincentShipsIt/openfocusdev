import SwiftUI
import TodoCore
import TodoData

/// A single task row. This is **content**, so it stays on standard materials — no
/// glass (per the liquid-glass restraint rules).
struct TaskRow: View {
    let task: TodoTask
    let onToggle: () -> Void

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: AppTheme.Spacing.sm) {
            Button(action: onToggle) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(task.isCompleted ? Color.secondary : task.priority.color)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 2) {
                Text(task.title)
                    .strikethrough(task.isCompleted)
                    .foregroundStyle(task.isCompleted ? .secondary : .primary)

                if task.dueDate != nil || !task.labels.isEmpty {
                    HStack(spacing: AppTheme.Spacing.sm) {
                        if let due = task.dueDate {
                            Label {
                                Text(due, format: dueFormat)
                            } icon: {
                                Image(systemName: "calendar")
                            }
                            .font(.caption)
                            .foregroundStyle(dueColor(due))
                        }
                        ForEach(task.labels, id: \.self) { label in
                            Text("#\(label)")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            Spacer(minLength: 0)

            if let project = task.project {
                Label(project.name, systemImage: project.symbol)
                    .font(.caption)
                    .labelStyle(.titleAndIcon)
                    .foregroundStyle(Color(hex: project.colorHex))
            }
        }
        .padding(.vertical, AppTheme.Spacing.sm)
        .contentShape(Rectangle())
    }

    private var dueFormat: Date.FormatStyle {
        .dateTime.weekday(.abbreviated).month(.abbreviated).day().hour().minute()
    }

    private func dueColor(_ date: Date) -> Color {
        !task.isCompleted && date < Date() ? Color(hex: "#DC4C3E") : .secondary
    }
}
