import Foundation

/// Which engine the AI features ("Plan my day", natural-language refinement) talk
/// to. OpenRouter is the default and works on every platform; the two local agent
/// CLIs are opt-in choices for users who'd rather spend their existing Claude /
/// ChatGPT subscription than an API key.
public enum AIBackend: String, CaseIterable, Sendable, Identifiable {
    case openRouter = "openrouter"
    case claudeCLI = "claude_cli"
    case codexCLI = "codex_cli"

    public var id: String { rawValue }

    public var label: String {
        switch self {
        case .openRouter: return "OpenRouter (API key)"
        case .claudeCLI: return "Claude CLI"
        case .codexCLI: return "Codex CLI"
        }
    }

    public var detail: String {
        switch self {
        case .openRouter: return "Calls OpenRouter over HTTP with the API key below. The default."
        case .claudeCLI: return "Runs the local `claude` CLI using your Claude subscription. No API key."
        case .codexCLI: return "Runs the local `codex` CLI using your ChatGPT auth. No API key."
        }
    }

    /// The CLI this backend drives, or `nil` for the hosted backend.
    public var cliAgent: CLIAgentAIClient.Agent? {
        switch self {
        case .openRouter: return nil
        case .claudeCLI: return .claude
        case .codexCLI: return .codex
        }
    }

    /// The backend used until the user picks one. OpenRouter: it's the only
    /// backend that works on every platform and needs nothing installed, so the
    /// CLI backends stay an explicit opt-in rather than something auto-detection
    /// switches on behind the user's back.
    public static let defaultBackend: AIBackend = .openRouter

    /// Backends usable right now: a CLI backend qualifies only if its tool is
    /// installed; OpenRouter is always listed (it just needs a key).
    public static func available() -> [AIBackend] {
        allCases.filter { backend in
            guard let agent = backend.cliAgent else { return true }
            return CLIToolLocator.resolve(agent.commandName) != nil
        }
    }
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

    /// The selected backend, defaulting to `AIBackend.defaultBackend` until the
    /// user chooses otherwise in Settings.
    public var backend: AIBackend {
        get {
            guard let raw = defaults.string(forKey: Self.backendKey),
                  let backend = AIBackend(rawValue: raw)
            else { return AIBackend.defaultBackend }
            return backend
        }
        nonmutating set {
            defaults.set(newValue.rawValue, forKey: Self.backendKey)
        }
    }
}
