import Foundation
import Testing
@testable import TodoCore

@Suite struct DateExpressionParserTests {
    private func parser() -> DateExpressionParser {
        var comps = DateComponents()
        comps.year = 2026
        comps.month = 6
        comps.day = 22 // a Monday
        comps.hour = 8
        let now = Calendar.current.date(from: comps) ?? Date()
        return DateExpressionParser(now: now)
    }

    @Test func parsesPriorityBangs() {
        let draft = parser().parse("ship the release !!")
        #expect(draft.title == "ship the release")
        #expect(draft.priority == .urgent)
    }

    @Test func singleBangIsHigh() {
        #expect(parser().parse("call dentist !").priority == .high)
    }

    @Test func parsesAndStripsLabels() {
        let draft = parser().parse("email boss #work @urgent")
        #expect(draft.labels.contains("work"))
        #expect(draft.labels.contains("urgent"))
        #expect(draft.title == "email boss")
    }

    @Test func parsesTomorrow() {
        let draft = parser().parse("water plants tomorrow")
        #expect(draft.title == "water plants")
        #expect(draft.dueDate != nil)
    }

    @Test func parsesTimeOnly() {
        let draft = parser().parse("standup 9am")
        #expect(draft.title == "standup")
        #expect(draft.dueDate != nil)
    }

    @Test func plainNumbersAreNotTimes() {
        let draft = parser().parse("buy 3 apples")
        #expect(draft.title == "buy 3 apples")
        #expect(draft.dueDate == nil)
    }
}
