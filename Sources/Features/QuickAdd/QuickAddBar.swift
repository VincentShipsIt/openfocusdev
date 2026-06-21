import SwiftUI
import Combine

/// The floating quick-add bar. This is chrome → glass. Text is parsed on-device
/// ("report fri 5pm !!" → a dated, prioritized, labeled task).
struct QuickAddBar: View {
    @Binding var text: String
    let onSubmit: () -> Void
    @FocusState private var focused: Bool

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: "plus.circle.fill")
                .font(.title3)
                .foregroundStyle(.tint)

            TextField("Add a task…", text: $text)
                .textFieldStyle(.plain)
                .focused($focused)
                .onSubmit(onSubmit)

            if !text.trimmingCharacters(in: .whitespaces).isEmpty {
                Button("Add", action: onSubmit)
                    .buttonStyle(.glassProminent)
            }
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
        .floatingGlassCard()
        .onReceive(NotificationCenter.default.publisher(for: .newTask)) { _ in
            focused = true
        }
    }
}
