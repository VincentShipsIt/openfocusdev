import Foundation
import SwiftData

/// A project groups tasks. CloudKit-mirrorable: defaults everywhere, optional
/// to-many, no unique constraints. Deleting a project nullifies its tasks'
/// `project` link (they fall back to the Inbox) rather than deleting them.
@Model
public final class Project {
    public var id: UUID = UUID()
    public var name: String = ""
    public var colorHex: String = "#DC4C3E"
    public var symbol: String = "number"
    public var order: Int = 0
    public var isFavorite: Bool = false
    public var createdAt: Date = Date()

    @Relationship(deleteRule: .nullify, inverse: \TodoTask.project)
    public var tasks: [TodoTask]?

    public init(
        id: UUID = UUID(),
        name: String = "",
        colorHex: String = "#DC4C3E",
        symbol: String = "number",
        order: Int = 0,
        isFavorite: Bool = false
    ) {
        self.id = id
        self.name = name
        self.colorHex = colorHex
        self.symbol = symbol
        self.order = order
        self.isFavorite = isFavorite
        self.createdAt = Date()
    }
}

public extension Project {
    /// Active (incomplete) task count, for sidebar badges.
    var activeTaskCount: Int {
        (tasks ?? []).filter { $0.completedAt == nil }.count
    }
}
