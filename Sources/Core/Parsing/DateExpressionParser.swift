import Foundation

/// On-device natural-language parser for quick-add. Turns strings like
/// "submit report fri 5pm !! #work" into a `TaskDraft` with no network call.
/// Deliberately conservative: it extracts what it is confident about (dates,
/// times, priority bangs, labels) and leaves everything else in the title.
public struct DateExpressionParser: Sendable {
    public var calendar: Calendar
    public var now: Date

    public init(calendar: Calendar = .current, now: Date = Date()) {
        self.calendar = calendar
        self.now = now
    }

    public func parse(_ input: String) -> TaskDraft {
        let words = input.split(separator: " ").map(String.init)
        var priority: Priority = .medium
        var labels: [String] = []
        var dueDate: Date?
        var timeOfDay: (hour: Int, minute: Int)?
        var consumed = Set<Int>()

        for (index, raw) in words.enumerated() {
            let word = raw.lowercased()

            if !raw.isEmpty, raw.allSatisfy({ $0 == "!" }) {
                priority = raw.count >= 2 ? .urgent : .high
                consumed.insert(index)
            } else if raw.count > 1, raw.hasPrefix("#") || raw.hasPrefix("@") {
                labels.append(String(raw.dropFirst()))
                consumed.insert(index)
            } else if let day = relativeDay(for: word) {
                dueDate = calendar.startOfDay(for: day)
                consumed.insert(index)
            } else if word == "tonight" {
                dueDate = calendar.startOfDay(for: now)
                timeOfDay = (20, 0)
                consumed.insert(index)
            } else if let weekday = weekdayIndex(for: word) {
                let isNext = index > 0 && words[index - 1].lowercased() == "next"
                if isNext { consumed.insert(index - 1) }
                dueDate = calendar.startOfDay(for: nextWeekday(weekday, skipOneWeek: isNext))
                consumed.insert(index)
            } else if let time = parseTime(word) {
                timeOfDay = time
                consumed.insert(index)
            }
        }

        if let timeOfDay {
            let day = dueDate ?? calendar.startOfDay(for: now)
            dueDate = calendar.date(
                bySettingHour: timeOfDay.hour,
                minute: timeOfDay.minute,
                second: 0,
                of: day
            ) ?? day
        }

        let title = words.enumerated()
            .filter { !consumed.contains($0.offset) }
            .map(\.element)
            .joined(separator: " ")
            .trimmingCharacters(in: .whitespaces)

        return TaskDraft(
            title: title.isEmpty ? input : title,
            dueDate: dueDate,
            priority: priority,
            labels: labels
        )
    }

    // MARK: - Helpers

    private func relativeDay(for word: String) -> Date? {
        switch word {
        case "today": return now
        case "tomorrow", "tmrw", "tmr": return calendar.date(byAdding: .day, value: 1, to: now)
        default: return nil
        }
    }

    private func weekdayIndex(for word: String) -> Int? {
        let map: [String: Int] = [
            "sunday": 1, "sun": 1,
            "monday": 2, "mon": 2,
            "tuesday": 3, "tue": 3, "tues": 3,
            "wednesday": 4, "wed": 4,
            "thursday": 5, "thu": 5, "thur": 5, "thurs": 5,
            "friday": 6, "fri": 6,
            "saturday": 7, "sat": 7,
        ]
        return map[word]
    }

    /// The next date matching `weekday`. "next <weekday>" jumps a further week.
    private func nextWeekday(_ weekday: Int, skipOneWeek: Bool) -> Date {
        let todayWeekday = calendar.component(.weekday, from: now)
        var delta = (weekday - todayWeekday + 7) % 7
        if delta == 0 { delta = 7 } // a bare weekday name means the *coming* one
        var result = calendar.date(byAdding: .day, value: delta, to: now) ?? now
        if skipOneWeek {
            result = calendar.date(byAdding: .day, value: 7, to: result) ?? result
        }
        return result
    }

    private func parseTime(_ word: String) -> (hour: Int, minute: Int)? {
        let lower = word.lowercased()
        var meridiem: String?
        var core = lower
        if lower.hasSuffix("am") {
            meridiem = "am"
            core = String(lower.dropLast(2))
        } else if lower.hasSuffix("pm") {
            meridiem = "pm"
            core = String(lower.dropLast(2))
        }

        // Require a meridiem or a colon so plain numbers ("3 tasks") aren't eaten.
        guard meridiem != nil || core.contains(":") else { return nil }

        let parts = core.split(separator: ":")
        guard let hourPart = parts.first, var hour = Int(hourPart) else { return nil }
        let minute = parts.count > 1 ? (Int(parts[1]) ?? 0) : 0
        guard (0...23).contains(hour), (0...59).contains(minute) else { return nil }

        if let meridiem {
            if meridiem == "pm", hour < 12 { hour += 12 }
            if meridiem == "am", hour == 12 { hour = 0 }
        }
        return (hour, minute)
    }
}
