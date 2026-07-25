import Foundation
import SwiftData

/// A section groups tasks *within* a project (Todoist-style headers like "Planning",
/// "In Review"). CloudKit-mirrorable by construction: every stored property has a
/// default or is optional, the parent link is optional with an inverse, and there
/// are no unique constraints.
///
/// Deleting a section nullifies its tasks' `section` link — the tasks stay in the
/// owning project and fall back to its unsectioned area rather than being deleted.
@Model
public final class ProjectSection {
    public var id: UUID = UUID()
    public var name: String = ""
    public var order: Int = 0
    /// Archived sections are hidden from active navigation but retained (and
    /// restorable) so their task grouping survives. CloudKit-safe default.
    public var isArchived: Bool = false
    public var createdAt: Date = Date()

    /// Owning project. Optional for CloudKit; a section with no project is orphaned
    /// and treated as ungrouped (defensive — the services never create one).
    public var project: Project?

    @Relationship(deleteRule: .nullify, inverse: \TodoTask.section)
    public var tasks: [TodoTask]?

    public init(
        id: UUID = UUID(),
        name: String = "",
        order: Int = 0,
        isArchived: Bool = false
    ) {
        self.id = id
        self.name = name
        self.order = order
        self.isArchived = isArchived
        self.createdAt = Date()
    }
}

public extension ProjectSection {
    /// Active (incomplete) task count, for headers and badges.
    var activeTaskCount: Int {
        (tasks ?? []).filter { $0.completedAt == nil }.count
    }
}
