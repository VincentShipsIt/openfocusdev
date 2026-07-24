import SwiftUI
import OpenFocusData

/// iOS shell: a `TabView` (which adopts the Liquid Glass tab bar automatically).
struct MainTabView: View {
    @Environment(TaskService.self) private var taskService
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        TabView {
            ForEach(SmartList.allCases.filter { $0 != .completed }) { list in
                Tab(list.title, systemImage: list.symbol) {
                    NavigationStack {
                        TaskListContainer(selection: .smart(list))
                    }
                }
            }

            Tab("Projects", systemImage: "folder") {
                NavigationStack {
                    ProjectsListView()
                }
            }

            Tab("Settings", systemImage: "gearshape") {
                NavigationStack {
                    SettingsView()
                }
            }
        }
        .onChange(of: scenePhase) { _, phase in
            guard phase == .active else { return }
            Task { await taskService.reconcileReminders() }
        }
    }
}
