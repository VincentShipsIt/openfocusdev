import Foundation
import SwiftData
import OpenFocusCore

/// AI-native actions over the day's tasks. `@Observable` so the UI can bind to
/// `planState`; `@MainActor` because it reads tasks from the UI context and
/// creates models.
@MainActor
@Observable
public final class AIService {
    public enum State: Equatable {
        case idle
        case working
        case result(String)
        case failed(String)
    }

    public private(set) var planState: State = .idle

    private let client: AIClient
    private let taskService: TaskService

    public init(client: AIClient, taskService: TaskService) {
        self.client = client
        self.taskService = taskService
    }

    /// On-device natural-language capture → a task. Synchronous, no network.
    @discardableResult
    public func quickAdd(_ text: String, project: Project? = nil) -> TodoTask {
        let draft = NaturalLanguageTaskParser().parse(text)
        return taskService.create(draft, project: project)
    }

    /// Ask the planning agent to order today's tasks. Drives `planState`.
    public func planDay() async {
        planState = .working

        let tasks = taskService.today().map { task -> String in
            task.priority >= .high ? "\(task.title) (\(task.priority.label))" : task.title
        }

        let formatter = DateFormatter()
        formatter.dateStyle = .full
        let dateLabel = formatter.string(from: Date())

        do {
            let plan = try await client.complete(
                system: AIPrompts.planner,
                user: AIPrompts.planUserMessage(tasks: tasks, dateLabel: dateLabel)
            )
            planState = .result(plan)
        } catch let error as AIError {
            planState = .failed(Self.message(for: error))
        } catch {
            planState = .failed(error.localizedDescription)
        }
    }

    public func resetPlan() {
        planState = .idle
    }

    private static func message(for error: AIError) -> String {
        switch error {
        case .missingAPIKey: return "Add your AI API key in Settings to plan your day."
        case .requestFailed(let status, _): return "The AI request failed (HTTP \(status))."
        case .emptyResponse: return "The AI returned an empty plan."
        case .invalidResponse: return "Unexpected response from the AI endpoint."
        }
    }
}
