import Foundation

/// Which engine the AI features ("Plan my day", natural-language refinement) talk
/// to. Two are local agent CLIs that need no API key; the third is the hosted
/// OpenRouter fallback.
public enum AIBackend: String, CaseIterable, Sendable, Identifiable {
    case claudeCLI = "claude_cli"
    case codexCLI = "codex_cli"
    case openRouter = "openrouter"

    public var id: String { rawValue }

    public var label: String {
        switch self {
        case .claudeCLI: return "Claude CLI"
        case .codexCLI: return "Codex CLI"
        case .openRouter: return "API key (OpenRouter)"
        }
    }

    public var detail: String {
        switch self {
        case .claudeCLI: return "Runs the local `claude` CLI using your Claude subscription. No API key."
        case .codexCLI: return "Runs the local `codex` CLI using your ChatGPT auth. No API key."
        case .openRouter: return "Calls OpenRouter over HTTP with the API key below."
        }
    }

    /// The CLI this backend drives, or `nil` for the hosted backend.
    public var cliAgent: CLIAgentAIClient.Agent? {
        switch self {
        case .claudeCLI: return .claude
        case .codexCLI: return .codex
        case .openRouter: return nil
        }
    }

    /// Backends usable right now: a CLI backend qualifies only if its tool is
    /// installed; OpenRouter is always listed (it just needs a key).
    public static func available() -> [AIBackend] {
        allCases.filter { backend in
            guard let agent = backend.cliAgent else { return true }
            return CLIToolLocator.resolve(agent.commandName) != nil
        }
    }

    /// The backend to use before the user has chosen one: the first installed CLI
    /// (Claude, then Codex), otherwise OpenRouter.
    public static func detectedDefault() -> AIBackend {
        if CLIToolLocator.resolve(Agent.claude.commandName) != nil { return .claudeCLI }
        if CLIToolLocator.resolve(Agent.codex.commandName) != nil { return .codexCLI }
        return .openRouter
    }

    private typealias Agent = CLIAgentAIClient.Agent
}

/// User-facing AI settings that aren't secrets (the API key stays in the
/// Keychain). Backed by `UserDefaults`; safe to read from the routing client's
/// closure off the main actor.
public struct AIPreferences: @unchecked Sendable {
    private let defaults: UserDefaults
    private static let backendKey = "ai.backend"

    public init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    /// The selected backend. The first time (no stored value), this auto-detects
    /// an installed CLI so a fresh install plans without any setup.
    public var backend: AIBackend {
        get {
            if let raw = defaults.string(forKey: Self.backendKey),
               let backend = AIBackend(rawValue: raw) {
                return backend
            }
            return AIBackend.detectedDefault()
        }
        nonmutating set {
            defaults.set(newValue.rawValue, forKey: Self.backendKey)
        }
    }
}
