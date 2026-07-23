import Testing
@testable import OpenFocusCLIKit

@Suite struct OpenFocusCommandTests {
    @Test func parsesAddJoiningWords() {
        #expect(OpenFocusCommand.parse(["openfocus", "add", "buy", "milk"]) == .add("buy milk"))
    }

    @Test func parsesListAliases() {
        #expect(OpenFocusCommand.parse(["openfocus", "ls"]) == .list)
        #expect(OpenFocusCommand.parse(["openfocus", "today"]) == .list)
    }

    @Test func bareCommandIsHelp() {
        #expect(OpenFocusCommand.parse(["openfocus"]) == .help)
    }

    @Test func addWithoutTextIsHelp() {
        #expect(OpenFocusCommand.parse(["openfocus", "add"]) == .help)
    }
}
