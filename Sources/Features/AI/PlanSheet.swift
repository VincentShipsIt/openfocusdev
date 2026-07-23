import SwiftUI
import OpenFocusData

/// Shows the AI planning agent's output for today's tasks.
struct PlanSheet: View {
    @Environment(AIService.self) private var aiService
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                content.padding()
            }
            .navigationTitle("Plan my day")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        aiService.resetPlan()
                        dismiss()
                    }
                }
            }
        }
        .frame(minWidth: 420, minHeight: 480)
    }

    @ViewBuilder
    private var content: some View {
        switch aiService.planState {
        case .idle, .working:
            VStack(spacing: AppTheme.Spacing.md) {
                ProgressView()
                Text("Planning your day…").foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.top, 80)
        case .result(let plan):
            Text(plan)
                .font(.body)
                .textSelection(.enabled)
                .frame(maxWidth: .infinity, alignment: .leading)
        case .failed(let message):
            ContentUnavailableView(
                "Couldn't plan",
                systemImage: "exclamationmark.triangle",
                description: Text(message)
            )
            .padding(.top, 60)
        }
    }
}
