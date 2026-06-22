import Foundation
import SwiftData
import OpenCheckCore

/// Composition root shared by the app's `DependencyContainer` and the `opencheck` CLI.
/// Owns the model container and the services bound to its main context, so the
/// GUI and the terminal drive the exact same engine.
@MainActor
public final class OpenCheckServices {
    public let modelContainer: ModelContainer
    public let keychain: KeychainService
    public let taskService: TaskService
    public let projectService: ProjectService
    public let aiService: AIService

    public init(
        modelContainer: ModelContainer,
        keychain: KeychainService = KeychainService()
    ) {
        self.modelContainer = modelContainer
        self.keychain = keychain

        let context = modelContainer.mainContext
        let taskService = TaskService(context: context)
        self.taskService = taskService
        self.projectService = ProjectService(context: context)

        let client = OpenRouterAIClient(apiKey: { keychain.aiAPIKey })
        self.aiService = AIService(client: client, taskService: taskService)
    }

    public static func live(inMemory: Bool = false) -> OpenCheckServices {
        OpenCheckServices(modelContainer: OpenCheckModelContainer.live(inMemory: inMemory))
    }
}
