import SwiftUI
import OpenFocusCore

extension AppearanceMode {
    /// The SwiftUI override for this mode. `nil` means "don't override", which is
    /// how `system` keeps following the device.
    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }
}

/// Applies the stored appearance preference to a view hierarchy.
///
/// Attach once per window root: `preferredColorScheme` propagates down to sheets
/// and popovers from there, so Settings changing the value re-tints the whole app
/// immediately without anything else observing it.
private struct StoredAppearanceModifier: ViewModifier {
    @AppStorage(AppearanceMode.storageKey) private var mode: AppearanceMode = .defaultMode

    func body(content: Content) -> some View {
        content.preferredColorScheme(mode.colorScheme)
    }
}

extension View {
    func storedAppearance() -> some View {
        modifier(StoredAppearanceModifier())
    }
}
