import Foundation

/// Which appearance the app renders in. `system` follows the device, which is the
/// default and what most people want; the explicit cases exist for users who keep
/// the OS in one mode and this app in the other.
///
/// Raw values are persisted in `UserDefaults`, so they're a stored contract —
/// renaming a case is a migration, not a rename.
public enum AppearanceMode: String, CaseIterable, Identifiable, Sendable {
    case system
    case light
    case dark

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .system: return "System"
        case .light: return "Light"
        case .dark: return "Dark"
        }
    }

    public var symbol: String {
        switch self {
        case .system: return "circle.lefthalf.filled"
        case .light: return "sun.max"
        case .dark: return "moon"
        }
    }

    /// Follow the device until the user says otherwise.
    public static let defaultMode: AppearanceMode = .system

    /// The `UserDefaults` key the setting binds to. Shared by the window roots that
    /// apply the override and the Settings picker that writes it, so the two can't
    /// drift apart.
    public static let storageKey = "appearance.mode"
}
