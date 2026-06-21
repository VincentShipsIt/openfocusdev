import Foundation

/// The built-in smart lists shown in the sidebar (macOS) and tab bar (iOS).
enum SmartList: String, CaseIterable, Identifiable, Hashable {
    case today, upcoming, inbox, completed

    var id: String { rawValue }

    var title: String {
        switch self {
        case .today: return "Today"
        case .upcoming: return "Upcoming"
        case .inbox: return "Inbox"
        case .completed: return "Completed"
        }
    }

    var symbol: String {
        switch self {
        case .today: return "star"
        case .upcoming: return "calendar"
        case .inbox: return "tray"
        case .completed: return "checkmark.circle"
        }
    }
}

/// What the detail pane is showing: a smart list or a specific project.
enum SidebarSelection: Hashable {
    case smart(SmartList)
    case project(UUID)
}
