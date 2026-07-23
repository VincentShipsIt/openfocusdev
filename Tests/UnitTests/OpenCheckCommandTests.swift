import Testing
@testable import OpenCheckCLIKit

@Suite struct OpenCheckCommandTests {
    @Test func parsesAddJoiningWords() {
        #expect(OpenCheckCommand.parse(["todo", "add", "buy", "milk"]) == .add("buy milk"))
    }

    @Test func parsesListAliases() {
        #expect(OpenCheckCommand.parse(["todo", "ls"]) == .list)
        #expect(OpenCheckCommand.parse(["todo", "today"]) == .list)
    }

    @Test func bareCommandIsHelp() {
        #expect(OpenCheckCommand.parse(["todo"]) == .help)
    }

    @Test func addWithoutTextIsHelp() {
        #expect(OpenCheckCommand.parse(["todo", "add"]) == .help)
    }
}
