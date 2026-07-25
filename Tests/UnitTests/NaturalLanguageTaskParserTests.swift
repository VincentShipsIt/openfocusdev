import Foundation
import Testing
@testable import OpenFocusCore

@Suite
struct NaturalLanguageTaskParserTests {
    @Test func strippingRemovesEveryProjectToken() {
        let stripped = NaturalLanguageTaskParser.strippingProjectTokens(
            from: "draft memo #home #work"
        )
        #expect(stripped == "draft memo")
    }

    @Test func strippingKeepsLabelsAndPriority() {
        let stripped = NaturalLanguageTaskParser.strippingProjectTokens(
            from: "email boss #work @urgent !1"
        )
        #expect(stripped == "email boss @urgent !1")
    }

    /// A bare `#` is prose, not a project — the parser keeps it in the title, so
    /// stripping has to keep it too.
    @Test func strippingKeepsABareHash() {
        let stripped = NaturalLanguageTaskParser.strippingProjectTokens(
            from: "count the # of rows"
        )
        #expect(stripped == "count the # of rows")
    }

    @Test func strippingLeavesTokenFreeTextAlone() {
        let stripped = NaturalLanguageTaskParser.strippingProjectTokens(from: "buy milk")
        #expect(stripped == "buy milk")
    }
}
