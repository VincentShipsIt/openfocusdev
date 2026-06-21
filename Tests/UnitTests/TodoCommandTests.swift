import Testing
@testable import TodoCLIKit

@Suite struct TodoCommandTests {
    @Test func parsesAddJoiningWords() {
        #expect(TodoCommand.parse(["todo", "add", "buy", "milk"]) == .add("buy milk"))
    }

    @Test func parsesListAliases() {
        #expect(TodoCommand.parse(["todo", "ls"]) == .list)
        #expect(TodoCommand.parse(["todo", "today"]) == .list)
    }

    @Test func bareCommandIsHelp() {
        #expect(TodoCommand.parse(["todo"]) == .help)
    }

    @Test func addWithoutTextIsHelp() {
        #expect(TodoCommand.parse(["todo", "add"]) == .help)
    }
}
