import Foundation

/// Entry point for natural-language quick-add. Runs the on-device
/// `DateExpressionParser` (synchronous, network-free). The optional LLM
/// refinement path lives in `AIService` (TodoData) so Core stays offline.
public struct NaturalLanguageTaskParser: Sendable {
    private let dateParser: DateExpressionParser

    public init(now: Date = Date(), calendar: Calendar = .current) {
        self.dateParser = DateExpressionParser(calendar: calendar, now: now)
    }

    public func parse(_ input: String) -> TaskDraft {
        dateParser.parse(input)
    }
}
