import Foundation

/// Tiny command parser for the `todo` tool. Pure (no persistence) so it unit-tests
/// on a Command Line Tools–only host.
public enum TodoCommand: Equatable {
    case add(String)
    case list
    case help

    public static func parse(_ arguments: [String]) -> TodoCommand {
        var args = arguments
        if !args.isEmpty { args.removeFirst() } // drop the executable path
        guard let verb = args.first?.lowercased() else { return .help }

        switch verb {
        case "add", "a":
            let text = args.dropFirst().joined(separator: " ")
            return text.isEmpty ? .help : .add(text)
        case "list", "ls", "today", "l":
            return .list
        default:
            return .help
        }
    }

    public static let usage = """
    OpenTodo — terminal companion to the app (shared engine, shared store).

    Usage:
      todo add <text>   Add a task. Natural language works: "report fri 5pm !!"
      todo list         List today's and overdue tasks
      todo help         Show this help
    """
}
