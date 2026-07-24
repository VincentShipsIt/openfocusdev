import Foundation

/// An `AIClient` that drives a locally-installed agent CLI — Claude Code
/// (`claude`) or Codex (`codex`) — in headless mode instead of calling a hosted
/// API. There is **no API key**: each CLI authenticates with the user's existing
/// subscription. OpenFocus ships unsandboxed and ad-hoc signed, so spawning the
/// tool is permitted.
///
/// The same `AIClient.complete(system:user:)` seam every feature already uses, so
/// this drops in next to `OpenRouterAIClient` with no caller changes.
public struct CLIAgentAIClient: AIClient {
    /// Which CLI to drive. Each maps to a distinct headless invocation.
    public enum Agent: String, Sendable, CaseIterable {
        case claude
        case codex

        /// The executable name to look up on `PATH`.
        public var commandName: String { rawValue }
    }

    private let agent: Agent
    private let executableURL: URL
    private let model: String?
    private let timeout: TimeInterval

    /// Build a client against an explicit executable (used by tests and callers
    /// that already resolved the path).
    public init(agent: Agent, executableURL: URL, model: String? = nil, timeout: TimeInterval = 120) {
        self.agent = agent
        self.executableURL = executableURL
        self.model = model
        self.timeout = timeout
    }

    /// Build a client by locating the CLI on disk. Returns `nil` when the tool
    /// isn't installed, so callers can fall back to another backend.
    public init?(agent: Agent, model: String? = nil, timeout: TimeInterval = 120) {
        guard let url = CLIToolLocator.resolve(agent.commandName) else { return nil }
        self.init(agent: agent, executableURL: url, model: model, timeout: timeout)
    }

    public func complete(system: String, user: String) async throws -> String {
        #if os(macOS)
        switch agent {
        case .claude: return try await runClaude(system: system, user: user)
        case .codex: return try await runCodex(system: system, user: user)
        }
        #else
        // Local CLI backends drive a subprocess (`Foundation.Process`), which
        // only exists on macOS. On iOS this client is never constructed — the
        // locator finds nothing — but the seam still has to compile, so fail
        // loudly if it is ever reached.
        throw AIError.cliFailed("Local CLI backends aren't available on this platform.")
        #endif
    }

    #if os(macOS)
    // MARK: - Claude Code

    /// `claude -p` (print / non-interactive). The system prompt is passed as a
    /// flag and the user message on stdin; `--output-format text` makes stdout
    /// the bare answer.
    private func runClaude(system: String, user: String) async throws -> String {
        var arguments = ["-p", "--system-prompt", system, "--output-format", "text"]
        if let model { arguments += ["--model", model] }

        let result = try await CLIProcess.run(
            executableURL: executableURL,
            arguments: arguments,
            stdin: user,
            timeout: timeout
        )
        guard result.exitCode == 0 else {
            throw AIError.cliFailed(Self.failureMessage(agent: agent, result: result))
        }
        let output = result.standardOutput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !output.isEmpty else { throw AIError.emptyResponse }
        return output
    }

    // MARK: - Codex

    /// `codex exec` (non-interactive). Codex takes a single instruction, so the
    /// system + user prompts are concatenated. We run it read-only in a scratch
    /// directory and read only the final assistant message via
    /// `--output-last-message`, ignoring its streamed event transcript.
    private func runCodex(system: String, user: String) async throws -> String {
        let prompt = system + "\n\n" + user
        let scratch = FileManager.default.temporaryDirectory
        let lastMessageURL = scratch.appendingPathComponent("openfocus-codex-\(UUID().uuidString).txt")
        defer { try? FileManager.default.removeItem(at: lastMessageURL) }

        var arguments = [
            "exec",
            "--sandbox", "read-only",
            "--skip-git-repo-check",
            "--color", "never",
            "-C", scratch.path,
            "--output-last-message", lastMessageURL.path,
        ]
        if let model { arguments += ["-m", model] }
        arguments.append("-") // read the instruction from stdin

        let result = try await CLIProcess.run(
            executableURL: executableURL,
            arguments: arguments,
            stdin: prompt,
            timeout: timeout
        )
        guard result.exitCode == 0 else {
            throw AIError.cliFailed(Self.failureMessage(agent: agent, result: result))
        }
        let output = ((try? String(contentsOf: lastMessageURL, encoding: .utf8)) ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard !output.isEmpty else { throw AIError.emptyResponse }
        return output
    }

    // MARK: - Failure messages

    private static func failureMessage(agent: Agent, result: CLIProcessResult) -> String {
        if result.timedOut {
            return "The \(agent.commandName) CLI timed out. Try again, or pick another backend in Settings."
        }
        let stderr = result.standardError.trimmingCharacters(in: .whitespacesAndNewlines)
        let firstLine = stderr.split(separator: "\n").first.map(String.init) ?? ""
        let detail = firstLine.isEmpty ? "" : " — \(firstLine)"
        return "The \(agent.commandName) CLI failed (exit \(result.exitCode))\(detail). "
            + "If it isn't signed in yet, run `\(agent.commandName)` once in Terminal to authenticate."
    }
    #endif
}

#if os(macOS)
// MARK: - Process runner

/// The captured result of a finished subprocess.
struct CLIProcessResult: Sendable {
    let exitCode: Int32
    let standardOutput: String
    let standardError: String
    let timedOut: Bool
}

/// Runs a subprocess off the main actor, feeds it `stdin`, drains stdout/stderr
/// concurrently (so a full pipe buffer can't deadlock the child), and enforces a
/// hard timeout.
enum CLIProcess {
    static func run(
        executableURL: URL,
        arguments: [String],
        stdin input: String,
        environment: [String: String]? = nil,
        timeout: TimeInterval
    ) async throws -> CLIProcessResult {
        let context = RunContext()
        context.process.executableURL = executableURL
        context.process.arguments = arguments
        context.process.currentDirectoryURL = FileManager.default.temporaryDirectory
        context.process.environment = environment ?? augmentedEnvironment()
        context.process.standardOutput = context.outPipe
        context.process.standardError = context.errPipe
        context.process.standardInput = context.inPipe

        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<CLIProcessResult, Error>) in
            let queue = DispatchQueue(label: "com.openfocus.cli-agent", qos: .userInitiated)
            queue.async {
                do {
                    try context.process.run()
                } catch {
                    continuation.resume(throwing: AIError.cliFailed(
                        "Couldn't launch \(executableURL.lastPathComponent): \(error.localizedDescription)"
                    ))
                    return
                }

                // Drain both pipes concurrently before waiting on exit.
                let readQueue = DispatchQueue(label: "com.openfocus.cli-agent.read", attributes: .concurrent)
                let group = DispatchGroup()
                group.enter()
                readQueue.async {
                    context.io.setOut(context.outPipe.fileHandleForReading.readDataToEndOfFile())
                    group.leave()
                }
                group.enter()
                readQueue.async {
                    context.io.setErr(context.errPipe.fileHandleForReading.readDataToEndOfFile())
                    group.leave()
                }

                if let data = input.data(using: .utf8) {
                    context.inPipe.fileHandleForWriting.write(data)
                }
                try? context.inPipe.fileHandleForWriting.close()

                let watchdog = DispatchWorkItem {
                    if context.process.isRunning {
                        context.io.markTimedOut()
                        context.process.terminate()
                    }
                }
                // Fire the watchdog on a *separate* queue: `queue` is about to
                // block in `waitUntilExit()` below, so a timer scheduled on this
                // same serial queue would never run until the process had already
                // exited — defeating the timeout entirely.
                let timeoutQueue = DispatchQueue(label: "com.openfocus.cli-agent.timeout")
                timeoutQueue.asyncAfter(deadline: .now() + timeout, execute: watchdog)

                context.process.waitUntilExit()
                watchdog.cancel()
                group.wait()

                continuation.resume(returning: CLIProcessResult(
                    exitCode: context.process.terminationStatus,
                    standardOutput: String(bytes: context.io.out, encoding: .utf8) ?? "",
                    standardError: String(bytes: context.io.err, encoding: .utf8) ?? "",
                    timedOut: context.io.timedOut
                ))
            }
        }
    }

    /// GUI apps get a minimal `PATH`; extend it so the CLI can find any helpers
    /// it shells out to (node, git, …) while keeping the user's own entries.
    static func augmentedEnvironment() -> [String: String] {
        var environment = ProcessInfo.processInfo.environment
        let additions = [
            "/opt/homebrew/bin", "/usr/local/bin",
            (NSHomeDirectory() as NSString).appendingPathComponent(".local/bin"),
            "/usr/bin", "/bin",
        ]
        let current = (environment["PATH"] ?? "").split(separator: ":").map(String.init)
        var seen = Set<String>()
        let merged = (current + additions).filter { !$0.isEmpty && seen.insert($0).inserted }
        environment["PATH"] = merged.joined(separator: ":")
        return environment
    }
}

/// Owns the non-`Sendable` process plumbing so the dispatch closures can capture
/// a single `Sendable` handle. Access is confined to the runner's serial flow
/// plus lock-guarded output, which is why the unchecked conformance is sound.
private final class RunContext: @unchecked Sendable {
    let process = Process()
    let outPipe = Pipe()
    let errPipe = Pipe()
    let inPipe = Pipe()
    let io = ProcessIO()
}

/// Lock-guarded collector for the subprocess's output and timeout flag.
private final class ProcessIO: @unchecked Sendable {
    private let lock = NSLock()
    private var outData = Data()
    private var errData = Data()
    private var didTimeOut = false

    func setOut(_ data: Data) { lock.withLock { outData = data } }
    func setErr(_ data: Data) { lock.withLock { errData = data } }
    func markTimedOut() { lock.withLock { didTimeOut = true } }

    var out: Data { lock.withLock { outData } }
    var err: Data { lock.withLock { errData } }
    var timedOut: Bool { lock.withLock { didTimeOut } }
}
#endif
