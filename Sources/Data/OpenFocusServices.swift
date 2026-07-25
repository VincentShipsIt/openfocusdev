import Foundation
import SwiftData
import OpenFocusCore

/// Composition root shared by the app's `DependencyContainer` and the `openfocus` CLI.
/// Owns the model container and the services bound to its main context, so the
/// GUI and the terminal drive the exact same engine.
@MainActor
public final class OpenFocusServices {
    public let modelContainer: ModelContainer
    public let keychain: KeychainService
    public let reminderService: ReminderService
    public let aiPreferences: AIPreferences
    public let taskService: TaskService
    public let projectService: ProjectService
    public let aiService: AIService

    public init(
        modelContainer: ModelContainer,
        keychain: KeychainService = KeychainService(),
        aiPreferences: AIPreferences = AIPreferences()
    ) {
        self.modelContainer = modelContainer
        self.keychain = keychain
        self.aiPreferences = aiPreferences

        let context = modelContainer.mainContext
        let reminderService = ReminderService(scheduler: UserNotificationScheduler())
        self.reminderService = reminderService
        // Projects first: `TaskService` resolves a typed `#project` through it, so
        // it has to exist before the task service is built.
        let projectService = ProjectService(context: context)
        self.projectService = projectService
        let taskService = TaskService(
            context: context,
            reminderService: reminderService,
            projectService: projectService
        )
        self.taskService = taskService

        // Route to whichever backend Settings selects (OpenRouter by default, or
        // a local agent CLI if the user opts in), resolved fresh per call.
        let client = RoutingAIClient(
            keychain: keychain,
            backend: { aiPreferences.backend }
        )
        self.aiService = AIService(client: client, taskService: taskService)
    }

    public static func live(inMemory: Bool = false) -> OpenFocusServices {
        OpenFocusServices(modelContainer: OpenFocusModelContainer.live(inMemory: inMemory))
    }
}
