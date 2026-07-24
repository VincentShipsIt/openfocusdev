import Foundation

/// An `AIClient` that dispatches to whichever backend the user picked in
/// Settings. The choice is read fresh on every call (via the `backend` closure)
/// so switching backends takes effect immediately — no app restart, no
/// re-wiring. This is the single client `AIService` holds.
public struct RoutingAIClient: AIClient {
    private let keychain: KeychainService
    private let backend: @Sendable () -> AIBackend

    public init(
        keychain: KeychainService,
        backend: @escaping @Sendable () -> AIBackend
    ) {
        self.keychain = keychain
        self.backend = backend
    }

    public func complete(system: String, user: String) async throws -> String {
        try await resolveClient().complete(system: system, user: user)
    }

    /// Build the concrete client for the current backend. Throws
    /// `AIError.cliNotFound` when a CLI backend is selected but the tool has
    /// since been removed, surfacing an actionable message instead of silently
    /// falling back.
    private func resolveClient() throws -> AIClient {
        let selected = backend()
        guard let agent = selected.cliAgent else {
            return OpenRouterAIClient(apiKey: { keychain.aiAPIKey })
        }
        guard let client = CLIAgentAIClient(agent: agent) else {
            throw AIError.cliNotFound(tool: agent.commandName)
        }
        return client
    }
}
