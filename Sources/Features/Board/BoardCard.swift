import SwiftUI
import OpenFocusCore
import OpenFocusData

/// A single task on the board. Like `TaskRow` this is **content**, so it sits on a
/// standard material — glass stays on the chrome.
struct BoardCard: View {
    let task: TodoTask
    let onMove: (TaskStatus) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            HStack(alignment: .top, spacing: AppTheme.Spacing.sm) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.callout)
                    .foregroundStyle(task.isCompleted ? Color.secondary : task.priority.color)
                    .accessibilityHidden(true)

                Text(task.title)
                    .font(.subheadline)
                    .strikethrough(task.isCompleted)
                    .foregroundStyle(task.isCompleted ? .secondary : .primary)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer(minLength: 0)
            }

            if task.dueDate != nil || !task.labels.isEmpty || task.project != nil {
                HStack(spacing: AppTheme.Spacing.sm) {
                    if let due = task.dueDate {
                        Label {
                            Text(due, format: dueFormat)
                        } icon: {
                            Image(systemName: "calendar")
                        }
                        .font(.caption2)
                        .foregroundStyle(dueColor(due))
                    }

                    if let project = task.project {
                        Label(project.name, systemImage: project.symbol)
                            .font(.caption2)
                            .foregroundStyle(Color(hex: project.colorHex))
                    }

                    ForEach(task.labels, id: \.self) { label in
                        Text("#\(label)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.leading, 22)
            }
        }
        .padding(AppTheme.Spacing.sm)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background.secondary, in: .rect(cornerRadius: AppTheme.CornerRadius.md))
        .contentShape(.rect(cornerRadius: AppTheme.CornerRadius.md))
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
        // Drag is never the only way to move a card: the context menu covers
        // pointer + keyboard, and the rotor actions cover VoiceOver.
        .contextMenu {
            ForEach(otherStatuses) { status in
                Button {
                    onMove(status)
                } label: {
                    Label("Move to \(status.label)", systemImage: status.symbol)
                }
            }
        }
        .accessibilityActions {
            ForEach(otherStatuses) { status in
                Button("Move to \(status.label)") { onMove(status) }
            }
        }
    }

    private var otherStatuses: [TaskStatus] {
        TaskStatus.allCases.filter { $0 != task.status }
    }

    private var accessibilityLabel: String {
        var parts = [task.title, task.status.label]
        if let due = task.dueDate {
            parts.append("due \(due.formatted(dueFormat))")
        }
        if let project = task.project {
            parts.append(project.name)
        }
        return parts.joined(separator: ", ")
    }

    private var dueFormat: Date.FormatStyle {
        .dateTime.weekday(.abbreviated).month(.abbreviated).day()
    }

    private func dueColor(_ date: Date) -> Color {
        !task.isCompleted && date < Date() ? Color(hex: "#DC4C3E") : .secondary
    }
}
