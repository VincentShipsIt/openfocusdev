import SwiftUI

/// iOS shell: a `TabView` (which adopts the Liquid Glass tab bar automatically).
struct MainTabView: View {
    var body: some View {
        TabView {
            ForEach(SmartList.allCases.filter { $0 != .completed }) { list in
                NavigationStack {
                    TaskListContainer(selection: .smart(list))
                }
                .tabItem { Label(list.title, systemImage: list.symbol) }
            }

            NavigationStack {
                ProjectsListView()
            }
            .tabItem { Label("Projects", systemImage: "folder") }
        }
    }
}
