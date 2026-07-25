import SwiftUI
import OpenFocusCore

/// Initials in an accent-tinted circle — the profile entry point in Browse, and
/// the header of the profile screen itself. There are no accounts and no photos
/// to load, so initials are the whole avatar.
struct ProfileAvatar: View {
    let displayName: String
    var diameter: CGFloat = 28

    private var initials: String {
        UserProfile.initials(from: displayName)
    }

    var body: some View {
        Circle()
            .fill(
                LinearGradient(
                    colors: [.accentColor, .accentColor.opacity(0.6)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay {
                Text(initials)
                    // Scales with the circle so one view serves both the 28pt
                    // toolbar button and the 64pt header.
                    .font(.system(size: diameter * 0.42, weight: .semibold))
                    .foregroundStyle(.white)
            }
            .frame(width: diameter, height: diameter)
            .accessibilityLabel(
                displayName.trimmingCharacters(in: .whitespaces).isEmpty
                    ? "Profile"
                    : "Profile, \(displayName)"
            )
    }
}
