import Foundation
import SwiftData

/// A project groups tasks. CloudKit-mirrorable: defaults everywhere, optional
/// to-many, no unique constraints. Deleting a project nullifies its tasks'
/// `project` link (they fall back to the Inbox) rather than deleting them.
@Model
public final class Project {
    /// Deepest supported nesting level (root == 1). Chosen to match Todoist's
    /// personal hierarchy; `ProjectService` refuses to create children below it.
    public static let maxNestingDepth = 4

    public var id: UUID = UUID()
    public var name: String = ""
    public var colorHex: String = "#DC4C3E"
    public var symbol: String = "number"
    public var order: Int = 0
    public var isFavorite: Bool = false
    /// Archived projects are hidden from active navigation but retained (and
    /// restorable). CloudKit-safe default.
    public var isArchived: Bool = false
    public var createdAt: Date = Date()

    @Relationship(deleteRule: .nullify, inverse: \TodoTask.project)
    public var tasks: [TodoTask]?

    /// Sections belong to exactly one project and have no meaning without it, so a
    /// deleted project cascades to its sections (each section then nullifies its
    /// own tasks' links — see `ProjectSection`).
    @Relationship(deleteRule: .cascade, inverse: \ProjectSection.project)
    public var sections: [ProjectSection]?

    /// Parent project for sub-project nesting. Optional for CloudKit.
    public var parent: Project?

    /// Child projects. Deleting a parent promotes its children to top level
    /// (nullify) rather than deleting them; the UI layer confirms and offers undo.
    @Relationship(deleteRule: .nullify, inverse: \Project.parent)
    public var subprojects: [Project]?

    public init(
        id: UUID = UUID(),
        name: String = "",
        colorHex: String = "#DC4C3E",
        symbol: String = "number",
        order: Int = 0,
        isFavorite: Bool = false,
        isArchived: Bool = false
    ) {
        self.id = id
        self.name = name
        self.colorHex = colorHex
        self.symbol = symbol
        self.order = order
        self.isFavorite = isFavorite
        self.isArchived = isArchived
        self.createdAt = Date()
    }
}

public extension Project {
    /// Active (incomplete) task count, for sidebar badges.
    var activeTaskCount: Int {
        (tasks ?? []).filter { $0.completedAt == nil }.count
    }

    /// Nesting level, 1 for a root project. Walks the `parent` chain with a guard
    /// against cycles (a corrupted CloudKit merge can't spin this forever).
    var depth: Int {
        var level = 1
        var seen: Set<UUID> = [id]
        var current = parent
        while let node = current, seen.insert(node.id).inserted {
            level += 1
            current = node.parent
        }
        return level
    }

    /// Non-archived child projects in display order.
    var sortedSubprojects: [Project] {
        (subprojects ?? [])
            .filter { !$0.isArchived }
            .sorted { $0.order < $1.order }
    }

    /// Non-archived sections in display order.
    var sortedSections: [ProjectSection] {
        (sections ?? [])
            .filter { !$0.isArchived }
            .sorted { $0.order < $1.order }
    }
}
