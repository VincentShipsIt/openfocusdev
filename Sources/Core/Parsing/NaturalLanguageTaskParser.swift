import Foundation

/// Entry point for natural-language quick-add. Runs the on-device
/// `DateExpressionParser` (synchronous, network-free). The optional LLM
/// refinement path lives in `AIService` (OpenFocusData) so Core stays offline.
public struct NaturalLanguageTaskParser: Sendable {
    private let dateParser: DateExpressionParser

    public init(now: Date = Date(), calendar: Calendar = .current) {
        self.dateParser = DateExpressionParser(calendar: calendar, now: now)
    }

    public func parse(_ input: String) -> TaskDraft {
        dateParser.parse(input)
    }

    /// Drop every `#project` token from a quick-add string.
    ///
    /// The project picker calls this when the user chooses from the menu: a typed
    /// token wins at save time, so leaving one behind would let the picker and the
    /// text claim different projects. Stripping is the only way to make the two
    /// agree without second-guessing what the user meant.
    public static func strippingProjectTokens(from input: String) -> String {
        input
            .split(separator: " ")
            // Same rule the parser consumes on, so nothing it would keep in the
            // title is removed here — a bare "#" stays put.
            .filter { !($0.count > 1 && $0.hasPrefix("#")) }
            .joined(separator: " ")
    }
}
