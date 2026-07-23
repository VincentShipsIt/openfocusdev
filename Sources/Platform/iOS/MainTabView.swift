import Combine
import SwiftUI

/// iOS shell: Todoist's bottom bar — Inbox, Today, Upcoming, Browse. `TabView`
/// adopts the Liquid Glass tab bar automatically, so there is no custom chrome
/// here on purpose.
struct MainTabView: View {
    /// Drives the Today tab's numbered icon. Refreshed when the calendar day rolls
    /// over, and again on foreground in case the app was suspended across midnight.
    @State private var today = Date()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        TabView {
            ForEach(SmartList.tabs) { list in
                Tab(list.title, systemImage: list.symbol(on: today)) {
                    NavigationStack {
                        TaskListContainer(selection: .smart(list))
                    }
                }
            }

            Tab("Browse", systemImage: "square.grid.2x2") {
                NavigationStack {
                    BrowseView()
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .NSCalendarDayChanged)) { _ in
            today = Date()
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { today = Date() }
        }
    }
}
