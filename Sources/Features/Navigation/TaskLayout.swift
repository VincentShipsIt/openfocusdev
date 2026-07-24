import Foundation

/// How the detail pane renders the current selection. Persisted per selection and
/// per device (see `TaskListContainer`), never stored on the tasks themselves.
enum TaskLayout: String, CaseIterable, Identifiable, Hashable {
    case list
    case board

    var id: String { rawValue }

    var title: String {
        switch self {
        case .list: return "List"
        case .board: return "Board"
        }
    }

    var symbol: String {
        switch self {
        case .list: return "list.bullet"
        case .board: return "square.grid.3x1.below.line.grid.1x2"
        }
    }
}
