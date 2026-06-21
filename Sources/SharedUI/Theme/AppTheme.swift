import SwiftUI
import TodoCore

/// Layout tokens. Colors stay semantic and accent-driven so they read correctly
/// against Liquid Glass rather than being pinned to fixed hues.
enum AppTheme {
    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
    }

    enum CornerRadius {
        static let sm: CGFloat = 6
        static let md: CGFloat = 10
        static let lg: CGFloat = 16
        static let xl: CGFloat = 22
    }
}

extension Priority {
    /// Role color for the priority flag / completion ring.
    var color: Color {
        switch self {
        case .low: return .secondary
        case .medium: return .blue
        case .high: return .orange
        case .urgent: return Color(hex: "#DC4C3E")
        }
    }
}

extension Color {
    /// Hex initializer ("#RRGGBB" or "RRGGBB"). Falls back to the accent on bad input.
    init(hex: String) {
        let cleaned = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
        guard cleaned.count == 6, let value = UInt64(cleaned, radix: 16) else {
            self = .accentColor
            return
        }
        self = Color(
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255
        )
    }
}
