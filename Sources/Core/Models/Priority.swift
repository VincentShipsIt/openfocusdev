import Foundation

/// Task priority, ordered so `urgent` is the highest. Backed by `Int` for stable
/// SwiftData storage and trivial sorting.
public enum Priority: Int, Codable, CaseIterable, Sendable, Comparable {
    case low = 0
    case medium = 1
    case high = 2
    case urgent = 3

    public static func < (lhs: Priority, rhs: Priority) -> Bool {
        lhs.rawValue < rhs.rawValue
    }

    /// User-facing label.
    public var label: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }
}
