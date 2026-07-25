import Foundation
import Testing
@testable import OpenFocusCore

@Suite struct AppearanceModeTests {
    // MARK: - Stored contract

    @Test func rawValuesArePersistedSoTheyMustNotDrift() {
        // These strings live in UserDefaults on shipped devices. Changing one
        // silently resets that user's appearance back to System.
        #expect(AppearanceMode.system.rawValue == "system")
        #expect(AppearanceMode.light.rawValue == "light")
        #expect(AppearanceMode.dark.rawValue == "dark")
        #expect(AppearanceMode.storageKey == "appearance.mode")
    }

    @Test func defaultsToFollowingTheDevice() {
        #expect(AppearanceMode.defaultMode == .system)
    }

    @Test func unknownStoredValueIsNotDecoded() {
        // A future mode read by an older build has to fall back rather than crash;
        // the caller substitutes `defaultMode` for nil.
        #expect(AppearanceMode(rawValue: "sepia") == nil)
    }

    // MARK: - Presentation

    @Test func ordersPickerSystemFirst() {
        // System is the default, so it leads the picker.
        #expect(AppearanceMode.allCases == [.system, .light, .dark])
    }

    @Test func everyModeHasDistinctLabelAndSymbol() {
        let titles = AppearanceMode.allCases.map(\.title)
        let symbols = AppearanceMode.allCases.map(\.symbol)
        #expect(Set(titles).count == AppearanceMode.allCases.count)
        #expect(Set(symbols).count == AppearanceMode.allCases.count)
        #expect(titles.allSatisfy { !$0.isEmpty })
    }
}
