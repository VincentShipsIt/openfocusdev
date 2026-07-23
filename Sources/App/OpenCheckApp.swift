import SwiftUI
import SwiftData

@main
struct OpenCheckApp: App {
    @StateObject private var container: DependencyContainer

    init() {
        _container = StateObject(wrappedValue: DependencyContainer())
    }

    var body: some Scene {
        #if os(macOS)
        Window("OpenCheck", id: "main") {
            MainWindowView()
                .environmentObject(container)
                .environment(container.taskService)
                .environment(container.projectService)
                .environment(container.aiService)
        }
        .modelContainer(container.modelContainer)
        .commands { OpenCheckCommands() }
        .defaultSize(width: 1100, height: 720)

        Settings {
            SettingsView()
                .environmentObject(container)
        }
        #else
        WindowGroup {
            MainTabView()
                .environmentObject(container)
                .environment(container.taskService)
                .environment(container.projectService)
                .environment(container.aiService)
        }
        .modelContainer(container.modelContainer)
        #endif
    }
}
