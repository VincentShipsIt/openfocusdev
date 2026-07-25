import Foundation
import Testing
@testable import OpenFocusCore

@Suite
struct UserProfileTests {
    @Test func firstAndLastInitialsAreUppercased() {
        #expect(UserProfile.initials(from: "vincent shipsit") == "VS")
    }

    @Test func singleWordYieldsOneInitial() {
        #expect(UserProfile.initials(from: "Vincent") == "V")
    }

    /// Middle names are skipped: two glyphs is all the avatar has room for.
    @Test func middleWordsAreIgnored() {
        #expect(UserProfile.initials(from: "Ada King Lovelace") == "AL")
    }

    @Test(arguments: ["", "   ", "🎉 ✅"])
    func namesWithoutLettersFallBackToThePlaceholder(input: String) {
        #expect(UserProfile.initials(from: input) == UserProfile.placeholderInitials)
    }

    /// Leading punctuation and emoji are skipped rather than rendered as a
    /// mystery glyph.
    @Test func leadingPunctuationIsSkipped() {
        #expect(UserProfile.initials(from: "(vincent) *shipsit") == "VS")
    }

    @Test func digitsCountAsInitials() {
        #expect(UserProfile.initials(from: "3 blind mice") == "3M")
    }

    @Test func extraWhitespaceIsIgnored() {
        #expect(UserProfile.initials(from: "  vincent   shipsit  ") == "VS")
    }
}
