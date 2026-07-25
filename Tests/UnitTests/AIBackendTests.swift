import Foundation
import Testing
@testable import OpenFocusCore

@Suite struct AIBackendTests {
    // MARK: - Identity

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

    @Test func unsetPreferenceReadsAsTheDefaultBackend() {
        withPreferences(allowsLocalShell: true) { prefs, _ in
            #expect(prefs.backend == AIBackend.defaultBackend)
        }
    }

    @Test func roundTripsASelectionOnMac() {
        withPreferences(allowsLocalShell: true) { prefs, defaults in
            prefs.backend = .codexCLI
            // Re-read through a fresh instance: the round trip has to survive the
            // store, not just the in-memory property.
            #expect(AIPreferences(defaults: defaults, allowsLocalShell: true).backend == .codexCLI)
        }
    }

    @Test func storedCLIBackendNeverReachesTheClientWithoutAShell() {
        // The write is kept verbatim — a Mac and an iPhone can share defaults — but
        // the read resolves to something that actually works here.
        withPreferences(allowsLocalShell: false) { prefs, defaults in
            prefs.backend = .claudeCLI
            #expect(defaults.string(forKey: "ai.backend") == AIBackend.claudeCLI.rawValue)
            #expect(prefs.backend == .openRouter)
        }
    }

    @Test func garbledStoredValueFallsBackToTheDefault() {
        withPreferences(allowsLocalShell: true) { prefs, defaults in
            defaults.set("some_retired_backend", forKey: "ai.backend")
            #expect(prefs.backend == AIBackend.defaultBackend)
        }
    }

    /// Run `body` against an isolated `UserDefaults` suite, torn down afterwards so
    /// tests never touch — or leak into — the real app domain.
    private func withPreferences(
        allowsLocalShell: Bool,
        _ body: (AIPreferences, UserDefaults) -> Void
    ) {
        let suiteName = "openfocus.tests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }
        body(AIPreferences(defaults: defaults, allowsLocalShell: allowsLocalShell), defaults)
    }
}
