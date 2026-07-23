import Foundation

/// Tiny command parser for the `openfocus` tool. Pure (no persistence) so it unit-tests
/// on a Command Line Tools–only host.
public enum OpenFocusCommand: Equatable {
    case add(String)
    case list
    case help

    public static func parse(_ arguments: [String]) -> OpenFocusCommand {
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
    OpenFocus — terminal companion to the app (shared engine, shared store).

    Usage:
      openfocus add <text>   Add a task. Natural language works: "report fri 5pm !!"
      openfocus list         List today's and overdue tasks
      openfocus help         Show this help
    """
}
