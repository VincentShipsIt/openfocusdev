import Foundation
import SwiftData
import TodoCore
import TodoData

/// GUI composition root. Wraps the shared `TodoServices` engine (the same wiring
/// the `todo` CLI uses) and exposes it to SwiftUI via `.environmentObject`. No
/// server, no API client — everything is on-device SwiftData + the AI seam.
@MainActor
final class DependencyContainer: ObservableObject {
    let services: TodoServices

    var modelContainer: ModelContainer { services.modelContainer }
    var taskService: TaskService { services.taskService }
    var projectService: ProjectService { services.projectService }
    var aiService: AIService { services.aiService }
    var keychain: KeychainService { services.keychain }
    var aiPreferences: AIPreferences { services.aiPreferences }

    init() {
        self.services = TodoServices.live()
    }
}
