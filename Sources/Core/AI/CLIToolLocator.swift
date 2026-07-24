import Foundation

/// Finds a command-line tool's executable on disk.
///
/// A GUI app launched from Finder/Dock inherits only a minimal `PATH`
/// (`/usr/bin:/bin:/usr/sbin:/sbin`), so the agent CLIs the user installed via
/// Homebrew, `~/.local/bin`, Bun, … won't resolve by name the way they do in a
/// terminal. We probe the well-known install locations first (fast, no
/// subprocess), then fall back to asking the user's login shell to resolve the
/// tool through its own `PATH`.
public enum CLIToolLocator {
    /// Directories agent CLIs are commonly installed into, in priority order.
    /// `~` is expanded at lookup time.
    static let searchDirectories: [String] = [
        "~/.local/bin",        // Claude Code's standalone installer
        "/opt/homebrew/bin",   // Homebrew (Apple Silicon) — Codex cask
        "/usr/local/bin",      // Homebrew (Intel) / manual installs
        "~/.bun/bin",          // Bun global installs
        "~/.npm-global/bin",   // npm `--global` prefix
        "/usr/bin",
        "/bin",
    ]

    /// Resolve `name` to an executable URL, or `nil` if it isn't installed.
    /// `extraDirectories` are searched before the built-in list.
    public static func resolve(_ name: String, extraDirectories: [String] = []) -> URL? {
        let fileManager = FileManager.default
        for directory in extraDirectories + searchDirectories {
            let expanded = (directory as NSString).expandingTildeInPath
            let candidate = URL(fileURLWithPath: expanded).appendingPathComponent(name)
            if fileManager.isExecutableFile(atPath: candidate.path) {
                return candidate
            }
        }
        return loginShellResolve(name)
    }

    /// Ask the user's login shell to resolve `name` via its own `PATH`. Uses a
    /// non-interactive login shell so `~/.zprofile` (the real `PATH`) is sourced
    /// but `~/.zshrc` is not — which means user *aliases* are ignored and we get
    /// the underlying binary, never an alias string. Returns `nil` unless the
    /// shell prints an absolute path to an existing executable.
    private static func loginShellResolve(_ name: String) -> URL? {
        #if os(macOS)
        let shellPath = ProcessInfo.processInfo.environment["SHELL"] ?? "/bin/zsh"
        let process = Process()
        process.executableURL = URL(fileURLWithPath: shellPath)
        process.arguments = ["-lc", "command -v -- \(name)"]
        let outPipe = Pipe()
        process.standardOutput = outPipe
        process.standardError = FileHandle.nullDevice

        do {
            try process.run()
        } catch {
            return nil
        }
        let data = outPipe.fileHandleForReading.readDataToEndOfFile()
        process.waitUntilExit()

        guard process.terminationStatus == 0 else { return nil }
        let resolved = (String(bytes: data, encoding: .utf8) ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard resolved.hasPrefix("/"),
              FileManager.default.isExecutableFile(atPath: resolved)
        else { return nil }
        return URL(fileURLWithPath: resolved)
        #else
        // `Foundation.Process` is macOS-only; iOS can't shell out to resolve a
        // tool. Directory probing above already returned nil in the sandbox.
        return nil
        #endif
    }
}
