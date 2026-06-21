import SwiftUI

// Shared Liquid Glass vocabulary (macOS 26 / iOS 26).
//
// Apple's guidance: glass belongs to the *functional* layer — floating navigation
// and controls — never the content layer (task rows, notes). Use the Regular
// variant by default, tint only for emphasis, and group adjacent glass shapes in a
// single container so they blend/morph instead of stacking (glass cannot sample
// other glass). See `.agents/skills/liquid-glass/SKILL.md`.
//
// Both app targets deploy to OS 26, so these are unguarded — no `@available`.

extension View {
    /// A selectable glass surface — the idiomatic replacement for the old
    /// "opaque fill + stroke + clipShape" selection pattern. Selection reads as a
    /// tint on the glass rather than a solid background swap.
    func selectableGlass(
        selected: Bool,
        tint: Color = .accentColor,
        in shape: some Shape = Capsule()
    ) -> some View {
        glassEffect(
            selected ? .regular.tint(tint).interactive() : .regular.interactive(),
            in: shape
        )
    }

    /// A floating glass card for secondary chrome (the quick-add bar, AI panels).
    /// Not for long-form body text — that stays on the content layer.
    func floatingGlassCard(
        cornerRadius: CGFloat = AppTheme.CornerRadius.lg
    ) -> some View {
        glassEffect(.regular, in: .rect(cornerRadius: cornerRadius))
    }
}

/// Groups related glass elements in one `GlassEffectContainer` and hands the
/// content closure a `Namespace.ID` for `glassEffectID(_:in:)`, so adjacent shapes
/// blend and morph as one (and callers don't each mint a container).
struct GlassGroup<Content: View>: View {
    var spacing: CGFloat?
    @ViewBuilder var content: (Namespace.ID) -> Content
    @Namespace private var namespace

    init(
        spacing: CGFloat? = nil,
        @ViewBuilder content: @escaping (Namespace.ID) -> Content
    ) {
        self.spacing = spacing
        self.content = content
    }

    var body: some View {
        GlassEffectContainer(spacing: spacing) {
            content(namespace)
        }
    }
}
