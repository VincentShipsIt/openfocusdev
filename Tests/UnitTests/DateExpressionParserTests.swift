import Foundation
import Testing
@testable import OpenFocusCore

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

    @Test(arguments: [
        ("!1", Priority.urgent),
        ("!2", Priority.high),
        ("!3", Priority.medium),
        ("!4", Priority.low),
    ])
    func numberedBangSetsPriority(token: String, expected: Priority) {
        let draft = parser().parse("file taxes \(token)")
        #expect(draft.title == "file taxes")
        #expect(draft.priority == expected)
    }

    /// Out-of-range levels are far likelier typos than a request for a fifth
    /// priority, so they stay in the title instead of being clamped silently.
    @Test func unknownBangLevelStaysInTitle() {
        let draft = parser().parse("fix build !5")
        #expect(draft.title == "fix build !5")
        #expect(draft.priority == .medium)
    }

    @Test func hashAssignsProjectAndAtAssignsLabels() {
        let draft = parser().parse("email boss #work @urgent")
        #expect(draft.projectName == "work")
        #expect(draft.labels == ["urgent"])
        #expect(draft.title == "email boss")
    }

    /// A second `#` reads as a correction, not a second project — a task belongs
    /// to exactly one.
    @Test func lastProjectTokenWins() {
        let draft = parser().parse("draft memo #home #work")
        #expect(draft.projectName == "work")
        #expect(draft.title == "draft memo")
    }

    @Test func bareHashIsNotAProject() {
        let draft = parser().parse("count the # of rows")
        #expect(draft.projectName == nil)
        #expect(draft.title == "count the # of rows")
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
