import Foundation
import SwiftData
import OpenFocusCore

/// A task. CloudKit-mirrorable by construction: every stored property has a
/// default or is optional, relationships are optional with inverses, and there
/// are no unique constraints.
@Model
public final class TodoTask {
    public var id: UUID = UUID()
    public var title: String = ""
    public var notes: String?
    public var dueDate: Date?
    public var reminderEnabled: Bool = false
    public var completedAt: Date?
    public var priorityRaw: Int = Priority.medium.rawValue
    /// Board column. `completedAt` still owns done-ness — see `TaskStatus`.
    public var statusRaw: Int = TaskStatus.todo.rawValue
    public var labels: [String] = []
    public var order: Int = 0
    public var createdAt: Date = Date()
    public var updatedAt: Date = Date()

    // AI workflow fields (carried over from the original schema).
    public var aiEnabled: Bool = false
    public var aiPrompt: String?
    public var aiExecutionStatus: String?
    public var aiExecutionResult: String?

    // Recurrence is stored as a Codable blob to keep the schema flat & portable.
    public var recurrenceData: Data?

    // Relationships — optional for CloudKit. Self-relation for subtasks + project.
    public var project: Project?
    @Relationship(deleteRule: .cascade, inverse: \TodoTask.parent)
    public var subtasks: [TodoTask]?
    public var parent: TodoTask?

    public init(
        id: UUID = UUID(),
        title: String = "",
        notes: String? = nil,
        dueDate: Date? = nil,
        reminderEnabled: Bool = false,
        priority: Priority = .medium,
        labels: [String] = [],
        order: Int = 0
    ) {
        self.id = id
        self.title = title
        self.notes = notes
        self.dueDate = dueDate
        self.reminderEnabled = reminderEnabled
        self.priorityRaw = priority.rawValue
        self.labels = labels
        self.order = order
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

public extension TodoTask {
    var priority: Priority {
        get { Priority(rawValue: priorityRaw) ?? .medium }
        set { priorityRaw = newValue.rawValue }
    }

    var isCompleted: Bool { completedAt != nil }

    /// Which board column this task belongs in. Reads reconcile the stored value
    /// against `completedAt`; writes keep the two in step, so a drag onto Done and
    /// a tap on the list-view checkmark produce the same state.
    var status: TaskStatus {
        get { TaskStatus.resolved(storedRaw: statusRaw, completedAt: completedAt) }
        set {
            statusRaw = newValue.rawValue
            completedAt = newValue.completionDate(from: completedAt)
        }
    }

    var recurrence: RecurrenceRule? {
        get {
            guard let recurrenceData else { return nil }
            return try? JSONDecoder().decode(RecurrenceRule.self, from: recurrenceData)
        }
        set { recurrenceData = newValue.flatMap { try? JSONEncoder().encode($0) } }
    }

    func toggleCompletion() {
        // Routed through `status` so the board column follows the checkmark.
        status = isCompleted ? .todo : .done
        updatedAt = Date()
    }
}
