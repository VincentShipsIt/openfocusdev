import SwiftUI
import SwiftData
import TodoData

/// macOS shell: a `NavigationSplitView` whose sidebar and toolbar adopt Liquid
/// Glass automatically (built against the macOS 26 SDK — no custom chrome).
struct MainWindowView: View {
    @State private var selection: SidebarSelection? = .smart(.today)

    var body: some View {
        NavigationSplitView {
            SidebarView(selection: $selection)
                .navigationSplitViewColumnWidth(min: 220, ideal: 260)
        } detail: {
            if let selection {
                TaskListContainer(selection: selection)
            } else {
                ContentUnavailableView("Select a list", systemImage: "sidebar.left")
            }
        }
    }
}
