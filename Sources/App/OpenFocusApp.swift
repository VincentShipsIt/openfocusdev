import SwiftUI
import SwiftData

@main
struct OpenFocusApp: App {
    @StateObject private var container: DependencyContainer

    init() {
        _container = StateObject(wrappedValue: DependencyContainer())
    }

    var body: some Scene {
        #if os(macOS)
        Window("OpenFocus", id: "main") {
            MainWindowView()
                .environmentObject(container)
                .environment(container.taskService)
                .environment(container.projectService)
                .environment(container.aiService)
                .environment(container.reminderService)
                .storedAppearance()
                .task { await container.taskService.reconcileReminders() }
        }
        .modelContainer(container.modelContainer)
        .commands { OpenFocusCommands() }
        .defaultSize(width: 1100, height: 720)

        // Its own scene, so it needs the appearance override applied separately —
        // `preferredColorScheme` only reaches the window it's attached to.
        Settings {
            SettingsView()
                .environmentObject(container)
                .storedAppearance()
        }
        #else
        WindowGroup {
            MainTabView()
                .environmentObject(container)
                .environment(container.taskService)
                .environment(container.projectService)
                .environment(container.aiService)
                .environment(container.reminderService)
                .storedAppearance()
                .task { await container.taskService.reconcileReminders() }
        }
        .modelContainer(container.modelContainer)
        #endif
    }
}
