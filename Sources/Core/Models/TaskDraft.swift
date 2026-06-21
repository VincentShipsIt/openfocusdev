import Foundation

/// A storage- and platform-agnostic description of a task to create. Produced by
/// natural-language capture (and the CLI) and consumed by the data layer to make a
/// `TodoTask`. Keeping it in Core lets the engine be tested without SwiftData.
public struct TaskDraft: Sendable, Equatable {
    public var title: String
    public var notes: String?
    public var dueDate: Date?
    public var priority: Priority
    public var labels: [String]
    public var projectName: String?

    public init(
        title: String,
        notes: String? = nil,
        dueDate: Date? = nil,
        priority: Priority = .medium,
        labels: [String] = [],
        projectName: String? = nil
    ) {
        self.title = title
        self.notes = notes
        self.dueDate = dueDate
        self.priority = priority
        self.labels = labels
        self.projectName = projectName
    }
}
