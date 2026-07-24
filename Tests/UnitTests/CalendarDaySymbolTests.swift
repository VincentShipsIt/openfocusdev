import Foundation
import Testing
@testable import OpenFocusCore

@Suite struct CalendarDaySymbolTests {
    private let calendar = Calendar(identifier: .gregorian)

    private func date(year: Int, month: Int, day: Int) -> Date {
        var comps = DateComponents()
        comps.year = year
        comps.month = month
        comps.day = day
        comps.hour = 12
        return calendar.date(from: comps) ?? Date()
    }

    @Test func usesTheDayOfMonthAsTheSymbol() {
        let symbol = CalendarDaySymbol.systemName(for: date(year: 2026, month: 7, day: 23), calendar: calendar)
        #expect(symbol == "23.square")
    }

    @Test func singleDigitDaysAreNotZeroPadded() {
        let symbol = CalendarDaySymbol.systemName(for: date(year: 2026, month: 7, day: 3), calendar: calendar)
        #expect(symbol == "3.square")
    }

    @Test func everyDayOfMonthHasANumberedSymbol() {
        for day in 1...31 {
            let symbol = CalendarDaySymbol.systemName(for: date(year: 2026, month: 1, day: day), calendar: calendar)
            #expect(symbol == "\(day).square")
        }
    }

    @Test func symbolChangesWhenTheDayRollsOver() {
        let lastMoment = date(year: 2026, month: 7, day: 23)
        let nextDay = calendar.date(byAdding: .day, value: 1, to: lastMoment) ?? lastMoment
        #expect(CalendarDaySymbol.systemName(for: lastMoment, calendar: calendar) == "23.square")
        #expect(CalendarDaySymbol.systemName(for: nextDay, calendar: calendar) == "24.square")
    }

    @Test func symbolIsStableAcrossTheSameDay() {
        let morning = date(year: 2026, month: 2, day: 9)
        let night = calendar.date(byAdding: .hour, value: 11, to: morning) ?? morning
        #expect(
            CalendarDaySymbol.systemName(for: morning, calendar: calendar)
                == CalendarDaySymbol.systemName(for: night, calendar: calendar)
        )
    }
}
