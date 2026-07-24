import Foundation
import Testing
@testable import OpenFocusCore

@Suite struct CLIToolLocatorTests {
    @Test func resolvesAKnownSystemTool() {
        // `/bin/sh` exists and is executable on every macOS host.
        let url = CLIToolLocator.resolve("sh", extraDirectories: ["/bin"])
        #expect(url?.path == "/bin/sh")
    }

    @Test func returnsNilForAMissingTool() {
        #expect(CLIToolLocator.resolve("openfocus-definitely-not-installed-xyz") == nil)
    }
}

@Suite struct AIBackendTests {
    @Test func roundTripsRawValue() {
        for backend in AIBackend.allCases {
            #expect(AIBackend(rawValue: backend.rawValue) == backend)
        }
    }

    @Test func mapsToTheRightCLIAgent() {
        #expect(AIBackend.claudeCLI.cliAgent == .claude)
        #expect(AIBackend.codexCLI.cliAgent == .codex)
        #expect(AIBackend.openRouter.cliAgent == nil)
    }

    @Test func openRouterIsAlwaysAvailable() {
        #expect(AIBackend.available().contains(.openRouter))
    }

    /// OpenRouter is the shipped default; the CLI backends are opt-in and must
    /// never be selected by auto-detection alone.
    @Test func defaultBackendIsOpenRouter() {
        #expect(AIBackend.defaultBackend == .openRouter)
    }

    @Test func preferencesDefaultToOpenRouterWhenUnset() {
        withScratchDefaults { defaults in
            #expect(AIPreferences(defaults: defaults).backend == .openRouter)
        }
    }

    @Test func preferencesFallBackToTheDefaultForAnUnknownStoredValue() {
        withScratchDefaults { defaults in
            defaults.set("some_retired_backend", forKey: "ai.backend")
            #expect(AIPreferences(defaults: defaults).backend == .openRouter)
        }
    }

    @Test func preferencesRoundTripBackend() {
        withScratchDefaults { defaults in
            let prefs = AIPreferences(defaults: defaults)
            prefs.backend = .codexCLI
            #expect(AIPreferences(defaults: defaults).backend == .codexCLI)
        }
    }

    /// Run `body` against an isolated `UserDefaults` suite, torn down afterwards
    /// so tests never touch (or leak into) the real app domain.
    private func withScratchDefaults(_ body: (UserDefaults) -> Void) {
        let suiteName = "openfocus.tests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }
        body(defaults)
    }
}

@Suite struct CLIAgentAIClientTests {
    /// Claude mode: system prompt is a flag, user message is piped on stdin, and
    /// stdout is the answer. A fake `sh` script stands in for the real binary.
    @Test func claudeModePipesPromptAndReadsStdout() async throws {
        let script = try TestScript.make("""
        #!/bin/sh
        echo "PLAN:"
        cat            # echo back the piped user message
        """)
        defer { script.remove() }

        let client = CLIAgentAIClient(agent: .claude, executableURL: script.url, timeout: 15)
        let output = try await client.complete(system: "be brief", user: "buy milk")

        #expect(output.contains("PLAN:"))
        #expect(output.contains("buy milk"))
    }

    /// Codex mode: the final answer is read from the `--output-last-message`
    /// file, not stdout. The fake parses its own args to find that path.
    @Test func codexModeReadsLastMessageFile() async throws {
        let script = try TestScript.make(#"""
        #!/bin/sh
        out=""
        while [ "$#" -gt 0 ]; do
          if [ "$1" = "--output-last-message" ]; then shift; out="$1"; fi
          shift
        done
        cat > /dev/null            # consume the piped prompt
        printf 'CODEX PLAN' > "$out"
        """#)
        defer { script.remove() }

        let client = CLIAgentAIClient(agent: .codex, executableURL: script.url, timeout: 15)
        let output = try await client.complete(system: "s", user: "u")

        #expect(output == "CODEX PLAN")
    }

    @Test func nonZeroExitThrowsCLIFailed() async throws {
        let script = try TestScript.make("""
        #!/bin/sh
        echo "not signed in" >&2
        exit 3
        """)
        defer { script.remove() }

        let client = CLIAgentAIClient(agent: .claude, executableURL: script.url, timeout: 15)
        await #expect(throws: AIError.self) {
            _ = try await client.complete(system: "s", user: "u")
        }
    }

    @Test func emptyOutputThrowsEmptyResponse() async throws {
        let script = try TestScript.make("#!/bin/sh\ncat > /dev/null\n") // exits 0, prints nothing
        defer { script.remove() }

        let client = CLIAgentAIClient(agent: .claude, executableURL: script.url, timeout: 15)
        await #expect(throws: AIError.emptyResponse) {
            _ = try await client.complete(system: "s", user: "u")
        }
    }

    @Test func timesOutAndReportsIt() async throws {
        let script = try TestScript.make("#!/bin/sh\nsleep 5\n")
        defer { script.remove() }

        let client = CLIAgentAIClient(agent: .claude, executableURL: script.url, timeout: 0.5)
        let start = Date()
        await #expect(throws: AIError.self) {
            _ = try await client.complete(system: "s", user: "u")
        }
        // The watchdog must terminate the 5s sleep near the 0.5s deadline. If it
        // were scheduled on the queue blocked in `waitUntilExit()`, this would
        // take the full 5s — so a sub-3s bound guards that regression.
        #expect(Date().timeIntervalSince(start) < 3)
    }
}

/// A throwaway executable shell script for exercising the process runner without
/// the real `claude`/`codex` binaries.
private struct TestScript {
    let url: URL

    static func make(_ body: String) throws -> TestScript {
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("openfocus-clitest-\(UUID().uuidString).sh")
        try body.write(to: url, atomically: true, encoding: .utf8)
        try FileManager.default.setAttributes(
            [.posixPermissions: 0o755], ofItemAtPath: url.path
        )
        return TestScript(url: url)
    }

    func remove() { try? FileManager.default.removeItem(at: url) }
}
