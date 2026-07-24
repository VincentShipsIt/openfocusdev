import Foundation
import OpenFocusCore
import OpenFocusData

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

extension SmartList {
    /// The tasks this list shows, filtered and ordered exactly as the list renders
    /// them. One predicate, so a tab-bar badge count can never disagree with what the
    /// list itself displays. `now`/`calendar` are injectable and let a caller take a
    /// single stable read of "today" across a render pass.
    func filter(_ tasks: [TodoTask], now: Date = Date(), calendar: Calendar = .current) -> [TodoTask] {
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: now) ?? now
        let endOfToday = calendar.startOfDay(for: tomorrow)
        let ordered = tasks.sorted { $0.order < $1.order }

        switch self {
        case .today:
            return ordered.filter { $0.parent == nil && !$0.isCompleted && ($0.dueDate.map { $0 < endOfToday } ?? false) }
        case .upcoming:
            return ordered.filter { $0.parent == nil && !$0.isCompleted && ($0.dueDate.map { $0 >= endOfToday } ?? false) }
        case .inbox:
            return ordered.filter { $0.parent == nil && !$0.isCompleted && $0.project == nil }
        case .completed:
            return ordered.filter(\.isCompleted)
                .sorted { ($0.completedAt ?? .distantPast) > ($1.completedAt ?? .distantPast) }
        }
    }
}

/// What the detail pane is showing: a smart list or a specific project.
enum SidebarSelection: Hashable {
    case smart(SmartList)
    case project(UUID)
}
