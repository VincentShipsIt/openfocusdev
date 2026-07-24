import Foundation

/// Where a task sits on the board. Backed by `Int` for stable SwiftData storage
/// and left-to-right column ordering.
///
/// `completedAt` — not this enum — remains the source of truth for *done-ness*, so
/// the board and the Completed smart list can never disagree (and so records
/// written before this field existed still land in the right column). Use
/// ``resolved(storedRaw:completedAt:)`` to read and ``completionDate(from:now:)``
/// to write.
public enum TaskStatus: Int, Codable, CaseIterable, Sendable, Identifiable, Comparable {
    case todo = 0
    case doing = 1
    case done = 2

    public var id: Int { rawValue }

    public static func < (lhs: TaskStatus, rhs: TaskStatus) -> Bool {
        lhs.rawValue < rhs.rawValue
    }

    /// Column header.
    public var label: String {
        switch self {
        case .todo: return "To Do"
        case .doing: return "In Progress"
        case .done: return "Done"
        }
    }

    public var symbol: String {
        switch self {
        case .todo: return "circle"
        case .doing: return "circle.lefthalf.filled"
        case .done: return "checkmark.circle.fill"
        }
    }

    /// The column a task actually belongs in, reconciling the stored raw value
    /// against the completion timestamp.
    ///
    /// - A task with a `completedAt` is `.done`, whatever the stored value says —
    ///   this covers rows completed from the list view and rows that predate the
    ///   `statusRaw` column (which default to `.todo`).
    /// - A task stored as `.done` but with no `completedAt` was un-completed
    ///   elsewhere, so it falls back to `.todo`.
    public static func resolved(storedRaw: Int, completedAt: Date?) -> TaskStatus {
        if completedAt != nil { return .done }
        let stored = TaskStatus(rawValue: storedRaw) ?? .todo
        return stored == .done ? .todo : stored
    }

    /// The completion timestamp implied by moving a task into this column.
    ///
    /// Re-dropping an already-done task keeps its original completion time rather
    /// than bumping it, so "recently completed" ordering stays stable.
    public func completionDate(from existing: Date?, now: Date = Date()) -> Date? {
        self == .done ? (existing ?? now) : nil
    }
}
