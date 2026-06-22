import Foundation
import SwiftData
import OpenCheckCore
import OpenCheckData

/// GUI composition root. Wraps the shared `OpenCheckServices` engine (the same wiring
/// the `opencheck` CLI uses) and exposes it to SwiftUI via `.environmentObject`. No
/// server, no API client — everything is on-device SwiftData + the AI seam.
@MainActor
final class DependencyContainer: ObservableObject {
    let services: OpenCheckServices

    var modelContainer: ModelContainer { services.modelContainer }
    var taskService: TaskService { services.taskService }
    var projectService: ProjectService { services.projectService }
    var aiService: AIService { services.aiService }
    var keychain: KeychainService { services.keychain }

    init() {
        self.services = OpenCheckServices.live()
    }
}
