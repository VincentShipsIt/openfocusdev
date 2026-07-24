import Foundation

/// Configuration for the AI client. The endpoint is OpenAI-compatible (OpenRouter,
/// OpenAI, a local proxy, …). The key is fetched from the Keychain at call time.
public struct AIConfig: Sendable, Equatable {
    public var baseURL: URL
    public var model: String

    public init(
        baseURL: URL = URL(string: "https://openrouter.ai/api/v1")!,
        model: String = "anthropic/claude-sonnet-4.6"
    ) {
        self.baseURL = baseURL
        self.model = model
    }
}

public enum AIError: Error, Sendable, Equatable {
    case missingAPIKey
    case requestFailed(status: Int, body: String)
    case emptyResponse
    case invalidResponse
    /// A CLI backend is selected but its tool isn't installed.
    case cliNotFound(tool: String)
    /// A CLI backend ran but failed (non-zero exit, timeout, launch error). The
    /// associated string is a user-facing explanation.
    case cliFailed(String)
}

/// The seam every AI feature talks to. Swap the implementation (OpenRouter today,
/// Apple Foundation Models later) without touching callers.
public protocol AIClient: Sendable {
    func complete(system: String, user: String) async throws -> String
}
