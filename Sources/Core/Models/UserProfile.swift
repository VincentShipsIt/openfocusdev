import Foundation

/// The local account identity. OpenFocus has no server and no sign-in, so a
/// "profile" is just a display name the user picks, stored on the device — the
/// same shape as the appearance override, and for the same reason it lives in
/// Core: the storage key is a persisted contract and the initials derivation is
/// logic worth testing.
public enum UserProfile {
    /// The `UserDefaults` key the name binds to. Renaming it silently resets
    /// everyone's name, so treat a change as a migration.
    public static let displayNameKey = "profile.displayName"

    /// Stands in when no name is set — the avatar still needs a glyph, and an
    /// empty circle reads as a rendering bug.
    public static let placeholderInitials = "?"

    /// One or two initials for the avatar: first letter of the first word, plus
    /// first letter of the last. Leading punctuation and emoji are skipped rather
    /// than rendered as a mystery glyph, and a name that has no letters or digits
    /// at all falls back to the placeholder.
    public static func initials(from displayName: String) -> String {
        let firstCharacters = displayName
            .split(whereSeparator: \.isWhitespace)
            .compactMap { $0.first { $0.isLetter || $0.isNumber } }

        guard let first = firstCharacters.first else { return placeholderInitials }
        guard let last = firstCharacters.last, firstCharacters.count > 1 else {
            return String(first).uppercased()
        }
        return String([first, last]).uppercased()
    }
}
