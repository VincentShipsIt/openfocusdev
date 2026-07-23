import Foundation
import OpenFocusCore

/// The built-in smart lists. iOS puts Inbox/Today/Upcoming in the bottom bar
/// (Todoist's layout — Browse is the fourth tab and is not a task list); macOS
/// shows all of them, Completed included, in the sidebar.
enum SmartList: String, CaseIterable, Identifiable, Hashable {
    case inbox, today, upcoming, completed

    /// The lists that get a bottom-bar tab on iOS, in bar order.
    static let tabs: [SmartList] = [.inbox, .today, .upcoming]

    var id: String { rawValue }

    var title: String {
        switch self {
        case .inbox: return "Inbox"
        case .today: return "Today"
        case .upcoming: return "Upcoming"
        case .completed: return "Completed"
        }
    }

    /// `date` only matters for `.today`, whose icon carries the day-of-month the
    /// way Todoist's does. Callers that render Today must re-read this when the
    /// calendar day rolls over.
    func symbol(on date: Date = Date()) -> String {
        switch self {
        case .inbox: return "tray"
        case .today: return CalendarDaySymbol.systemName(for: date)
        case .upcoming: return "calendar"
        case .completed: return "checkmark.circle"
        }
    }
}

/// What the detail pane is showing: a smart list or a specific project.
enum SidebarSelection: Hashable {
    case smart(SmartList)
    case project(UUID)
}
