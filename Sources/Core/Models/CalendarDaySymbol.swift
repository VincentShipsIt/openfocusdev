import Foundation

/// SF Symbol name for "today, as a calendar day". Todoist's Today tab renders the
/// current day-of-month inside its icon; SF Symbols ships numbered squares
/// (`1.square` … `50.square`), so the day number *is* the symbol.
///
/// Pure and calendar-injectable so the day-boundary behaviour is unit-testable
/// without the SwiftUI app target.
public enum CalendarDaySymbol {
    /// Shown when the day-of-month has no numbered symbol. Defensive: every
    /// Gregorian day (1...31) has one.
    public static let fallbackSystemName = "calendar"

    /// Day numbers with a `<n>.square` SF Symbol. SF Symbols covers 0...50; a
    /// month never exceeds 31 days, so that is the range we claim.
    static let numberedDays = 1...31

    /// The symbol for `date`'s day-of-month, e.g. the 23rd → `"23.square"`.
    public static func systemName(for date: Date, calendar: Calendar = .current) -> String {
        let day = calendar.component(.day, from: date)
        guard numberedDays.contains(day) else { return fallbackSystemName }
        return "\(day).square"
    }
}
