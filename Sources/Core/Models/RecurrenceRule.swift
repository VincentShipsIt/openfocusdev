import Foundation

/// A repeat rule for a task. Value type; persisted as a Codable blob on the model
/// so the SwiftData schema stays flat and CloudKit-friendly.
public struct RecurrenceRule: Codable, Sendable, Equatable {
    public enum Frequency: String, Codable, Sendable, CaseIterable {
        case daily, weekly, monthly, yearly
    }

    public var frequency: Frequency
    public var interval: Int
    /// 1 = Sunday … 7 = Saturday (Calendar's `.weekday`). Weekly rules only.
    public var daysOfWeek: [Int]
    public var endDate: Date?

    public init(
        frequency: Frequency,
        interval: Int = 1,
        daysOfWeek: [Int] = [],
        endDate: Date? = nil
    ) {
        self.frequency = frequency
        self.interval = max(1, interval)
        self.daysOfWeek = daysOfWeek
        self.endDate = endDate
    }

    /// The next occurrence strictly after `date`, or `nil` once past `endDate`.
    public func nextDate(after date: Date, calendar: Calendar = .current) -> Date? {
        let component: Calendar.Component
        switch frequency {
        case .daily: component = .day
        case .weekly: component = .weekOfYear
        case .monthly: component = .month
        case .yearly: component = .year
        }
        guard let next = calendar.date(byAdding: component, value: interval, to: date) else { return nil }
        if let endDate, next > endDate { return nil }
        return next
    }
}
