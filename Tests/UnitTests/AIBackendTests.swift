import Foundation
import Testing
@testable import OpenFocusCore

@Suite struct AIBackendTests {
    // MARK: - requiresLocalShell

    @Test func onlyTheCLIBackendsNeedAShell() {
        #expect(AIBackend.openRouter.requiresLocalShell == false)
        #expect(AIBackend.claudeCLI.requiresLocalShell)
        #expect(AIBackend.codexCLI.requiresLocalShell)
    }

    // MARK: - offered(allowsLocalShell:)

    @Test func macOffersEveryBackend() {
        #expect(AIBackend.offered(allowsLocalShell: true) == AIBackend.allCases)
    }

    @Test func iOSOffersOnlyTheHostedBackend() {
        // Issue #10: the local Claude and Codex CLI backends must never be offered
        // on iOS — there's no shell to run them in.
        #expect(AIBackend.offered(allowsLocalShell: false) == [.openRouter])
    }

    // MARK: - resolved(_:allowsLocalShell:)

    @Test func honoursACLIChoiceWhereAShellExists() {
        #expect(AIBackend.resolved(.claudeCLI, allowsLocalShell: true) == .claudeCLI)
        #expect(AIBackend.resolved(.codexCLI, allowsLocalShell: true) == .codexCLI)
    }

    @Test func coercesACLIChoiceWhereNoShellExists() {
        // A Mac-selected backend can arrive on iOS via a restored backup; falling
        // back beats failing every AI request with `cliNotFound`.
        #expect(AIBackend.resolved(.claudeCLI, allowsLocalShell: false) == .openRouter)
        #expect(AIBackend.resolved(.codexCLI, allowsLocalShell: false) == .openRouter)
    }

    @Test func leavesTheHostedBackendAloneEverywhere() {
        #expect(AIBackend.resolved(.openRouter, allowsLocalShell: false) == .openRouter)
        #expect(AIBackend.resolved(.openRouter, allowsLocalShell: true) == .openRouter)
    }

    // MARK: - AIPreferences

    /// Isolated defaults so these never touch the developer's real preferences.
    private func preferences(allowsLocalShell: Bool) -> (AIPreferences, UserDefaults) {
        let suite = UserDefaults(suiteName: "AIBackendTests.\(UUID().uuidString)")!
        return (AIPreferences(defaults: suite, allowsLocalShell: allowsLocalShell), suite)
    }

    @Test func unsetPreferenceReadsAsTheDefaultBackend() {
        let (prefs, _) = preferences(allowsLocalShell: true)
        #expect(prefs.backend == AIBackend.defaultBackend)
    }

    @Test func roundTripsASelectionOnMac() {
        let (prefs, _) = preferences(allowsLocalShell: true)
        prefs.backend = .codexCLI
        #expect(prefs.backend == .codexCLI)
    }

    @Test func storedCLIBackendNeverReachesTheClientWithoutAShell() {
        // The write is kept verbatim — a Mac and an iPhone can share defaults — but
        // the read resolves to something that actually works here.
        let (prefs, suite) = preferences(allowsLocalShell: false)
        prefs.backend = .claudeCLI
        #expect(suite.string(forKey: "ai.backend") == AIBackend.claudeCLI.rawValue)
        #expect(prefs.backend == .openRouter)
    }

    @Test func garbledStoredValueFallsBackToTheDefault() {
        let (prefs, suite) = preferences(allowsLocalShell: true)
        suite.set("gpt-9", forKey: "ai.backend")
        #expect(prefs.backend == AIBackend.defaultBackend)
    }
}
