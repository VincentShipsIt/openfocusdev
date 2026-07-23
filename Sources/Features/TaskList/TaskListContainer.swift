import SwiftUI
import SwiftData
import OpenFocusCore
import OpenFocusData

/// The detail pane: a filtered task list — or a kanban board — with a glass
/// quick-add bar and the "Plan my day" AI action. Shared by macOS (split-view
/// detail) and iOS (tabs).
struct TaskListContainer: View {
    let selection: SidebarSelection

    @Environment(TaskService.self) private var taskService
    @Environment(AIService.self) private var aiService
    @Query private var tasks: [TodoTask]
    @Query private var projects: [Project]

    /// Chosen layout for *this* selection. A per-selection, per-device preference,
    /// so it lives in `UserDefaults` rather than on the tasks themselves — switching
    /// to the board never writes to the store or syncs to another device.
    @AppStorage private var layout: TaskLayout
    @State private var quickAddText = ""
    @State private var showingPlan = false

    init(selection: SidebarSelection) {
        self.selection = selection
        _layout = AppStorage(wrappedValue: .list, Self.layoutKey(for: selection))
    }

    private static func layoutKey(for selection: SidebarSelection) -> String {
        switch selection {
        case .smart(let list): return "layout.smart.\(list.rawValue)"
        case .project(let id): return "layout.project.\(id.uuidString)"
        }
    }

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

    /// Tasks in scope for the current selection.
    ///
    /// The list hides completed rows; the board keeps them so its Done column has
    /// something in it. Every other predicate is shared, so the two layouts always
    /// show the same set of work.
    private func visibleTasks(includeCompleted: Bool = false) -> [TodoTask] {
        let calendar = Calendar.current
        let now = Date()
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: now) ?? now
        let endOfToday = calendar.startOfDay(for: tomorrow)
        let ordered = tasks.sorted { $0.order < $1.order }
        func included(_ task: TodoTask) -> Bool { includeCompleted || !task.isCompleted }

        switch selection {
        case .smart(.today):
            return ordered.filter { $0.parent == nil && included($0) && ($0.dueDate.map { $0 < endOfToday } ?? false) }
        case .smart(.upcoming):
            return ordered.filter { $0.parent == nil && included($0) && ($0.dueDate.map { $0 >= endOfToday } ?? false) }
        case .smart(.inbox):
            return ordered.filter { $0.parent == nil && included($0) && $0.project == nil }
        case .smart(.completed):
            return ordered.filter(\.isCompleted)
                .sorted { ($0.completedAt ?? .distantPast) > ($1.completedAt ?? .distantPast) }
        case .project(let id):
            return ordered.filter { $0.parent == nil && included($0) && $0.project?.id == id }
        }
    }

    var body: some View {
        content
            .safeAreaInset(edge: .bottom) {
                if !isCompletedList {
                    QuickAddBar(text: $quickAddText, onSubmit: submit)
                        .padding()
                }
            }
            .navigationTitle(title)
            .toolbar { toolbarContent }
            .sheet(isPresented: $showingPlan) {
                PlanSheet()
            }
    }

    @ViewBuilder
    private var content: some View {
        switch effectiveLayout {
        case .list:
            listContent
        case .board:
            BoardView(tasks: visibleTasks(includeCompleted: true)) { task, status in
                taskService.move(task, to: status)
            }
        }
    }

    private var listContent: some View {
        let visible = visibleTasks()
        return ScrollView {
            LazyVStack(spacing: 0) {
                if visible.isEmpty {
                    emptyState
                } else {
                    ForEach(visible) { task in
                        TaskRow(task: task) { taskService.toggleCompletion(task) }
                        Divider().padding(.leading, 40)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.top, AppTheme.Spacing.sm)
        }
    }

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        if supportsBoard {
            ToolbarItem(placement: .primaryAction) {
                Picker("Layout", selection: $layout) {
                    ForEach(TaskLayout.allCases) { option in
                        Label(option.title, systemImage: option.symbol).tag(option)
                    }
                }
                .pickerStyle(.segmented)
                .labelsHidden()
            }
        }

        ToolbarItem(placement: .primaryAction) {
            Button {
                showingPlan = true
                Task { await aiService.planDay() }
            } label: {
                Label("Plan my day", systemImage: "sparkles")
            }
        }
    }

    /// Completed is already a single "done" column, so it stays list-only and the
    /// stored preference is ignored rather than overwritten.
    private var supportsBoard: Bool { !isCompletedList }

    private var effectiveLayout: TaskLayout { supportsBoard ? layout : .list }

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
