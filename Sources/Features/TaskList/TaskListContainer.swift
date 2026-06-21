import SwiftUI
import SwiftData
import TodoCore
import TodoData

/// The detail pane: a filtered task list with a glass quick-add bar and the
/// "Plan my day" AI action. Shared by macOS (split-view detail) and iOS (tabs).
struct TaskListContainer: View {
    let selection: SidebarSelection

    @Environment(TaskService.self) private var taskService
    @Environment(AIService.self) private var aiService
    @Query private var tasks: [TodoTask]
    @Query private var projects: [Project]

    @State private var quickAddText = ""
    @State private var showingPlan = false

    private var project: Project? {
        guard case let .project(id) = selection else { return nil }
        return projects.first { $0.id == id }
    }

    private var title: String {
        switch selection {
        case .smart(let list): return list.title
        case .project: return project?.name ?? "Project"
        }
    }

    private var visibleTasks: [TodoTask] {
        let calendar = Calendar.current
        let now = Date()
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: now) ?? now
        let endOfToday = calendar.startOfDay(for: tomorrow)
        let ordered = tasks.sorted { $0.order < $1.order }

        switch selection {
        case .smart(.today):
            return ordered.filter { $0.parent == nil && !$0.isCompleted && ($0.dueDate.map { $0 < endOfToday } ?? false) }
        case .smart(.upcoming):
            return ordered.filter { $0.parent == nil && !$0.isCompleted && ($0.dueDate.map { $0 >= endOfToday } ?? false) }
        case .smart(.inbox):
            return ordered.filter { $0.parent == nil && !$0.isCompleted && $0.project == nil }
        case .smart(.completed):
            return ordered.filter(\.isCompleted)
                .sorted { ($0.completedAt ?? .distantPast) > ($1.completedAt ?? .distantPast) }
        case .project(let id):
            return ordered.filter { $0.parent == nil && !$0.isCompleted && $0.project?.id == id }
        }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if visibleTasks.isEmpty {
                    emptyState
                } else {
                    ForEach(visibleTasks) { task in
                        TaskRow(task: task) { taskService.toggleCompletion(task) }
                        Divider().padding(.leading, 40)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.top, AppTheme.Spacing.sm)
        }
        .safeAreaInset(edge: .bottom) {
            if !isCompletedList {
                QuickAddBar(text: $quickAddText, onSubmit: submit)
                    .padding()
            }
        }
        .navigationTitle(title)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showingPlan = true
                    Task { await aiService.planDay() }
                } label: {
                    Label("Plan my day", systemImage: "sparkles")
                }
            }
        }
        .sheet(isPresented: $showingPlan) {
            PlanSheet()
        }
    }

    private var isCompletedList: Bool {
        if case .smart(.completed) = selection { return true }
        return false
    }

    private var emptyState: some View {
        ContentUnavailableView(
            "Nothing here",
            systemImage: "checkmark.circle",
            description: Text("Add a task below — try \"report fri 5pm !!\".")
        )
        .padding(.top, 80)
    }

    private func submit() {
        let text = quickAddText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        aiService.quickAdd(text, project: project)
        quickAddText = ""
    }
}
