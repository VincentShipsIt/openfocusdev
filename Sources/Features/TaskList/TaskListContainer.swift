import Combine
import SwiftUI
import SwiftData
import OpenFocusCore
import OpenFocusData

/// The detail pane: a filtered task list — or a kanban board — with a split glass
/// chip that carries both quick-add and the "Plan my day" AI action. Shared by
/// macOS (split-view detail) and iOS (tabs).
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
    @State private var quickAddReminderEnabled = false
    /// Which project the compose sheet is filing into. Seeded from the current
    /// selection each time the sheet opens, so adding from inside a project lands
    /// there by default.
    @State private var quickAddProjectID: UUID?
    @State private var showingQuickAdd = false
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
    /// something in it. Smart lists route through `SmartList.filter` — the single
    /// predicate — so this pane and the tab-bar badge can never disagree.
    private func visibleTasks(includeCompleted: Bool = false) -> [TodoTask] {
        switch selection {
        case .smart(let list):
            return list.filter(tasks, includeCompleted: includeCompleted)
        case .project(let id):
            return tasks
                .sorted { $0.order < $1.order }
                .filter {
                    $0.parent == nil
                        && (includeCompleted || !$0.isCompleted)
                        && $0.project?.id == id
                }
        }
    }

    var body: some View {
        content
            .safeAreaInset(edge: .bottom) {
                if !isCompletedList {
                    HStack {
                        Spacer()
                        QuickAddChip(addAction: presentQuickAdd, planAction: planDay)
                    }
                    .padding()
                }
            }
            .sheet(isPresented: $showingQuickAdd) {
                QuickAddSheet(
                    text: $quickAddText,
                    reminderEnabled: $quickAddReminderEnabled,
                    projectID: $quickAddProjectID,
                    projects: projects.sorted { $0.order < $1.order },
                    onSubmit: submit
                )
            }
            .navigationTitle(title)
            .toolbar { toolbarContent }
            .sheet(isPresented: $showingPlan) {
                PlanSheet()
            }
            // Belongs to the pane, not the chip: the chip is hidden on Completed,
            // and ⌘N has to keep opening the compose sheet there too.
            .onReceive(NotificationCenter.default.publisher(for: .newTask)) { _ in
                presentQuickAdd()
            }
    }

    @ViewBuilder
    private var content: some View {
        switch effectiveLayout {
        case .list:
            listContent
        case .board:
            BoardView(tasks: visibleTasks(includeCompleted: true)) { task, status in
                Task { await taskService.move(task, to: status) }
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
                        TaskRow(
                            task: task,
                            onToggle: {
                                Task { await taskService.toggleCompletion(task) }
                            },
                            onToggleReminder: {
                                Task {
                                    await taskService.setReminderEnabled(
                                        !task.reminderEnabled,
                                        for: task
                                    )
                                }
                            }
                        )
                        Divider().padding(.leading, 40)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.top, AppTheme.Spacing.sm)
        }
    }

    /// Just the layout switch — "Plan my day" moved into the quick-add chip so the
    /// top of the pane stays clear.
    ///
    /// A menu, not a segmented control: iOS 26 gives every toolbar item its own
    /// glass background, so an icon-only segmented picker rendered as two separate
    /// pills under the title that read like unlabelled tabs. One button, and the
    /// layouts get named in words when you open it.
    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        if supportsBoard {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Picker("Layout", selection: $layout) {
                        ForEach(TaskLayout.allCases) { option in
                            Label(option.title, systemImage: option.symbol).tag(option)
                        }
                    }
                    .pickerStyle(.inline)
                } label: {
                    // Icon-only explicitly: the toolbar's glass pill is tight, and
                    // the `Label` still carries "Layout" for VoiceOver.
                    Label("Layout", systemImage: effectiveLayout.symbol)
                        .labelStyle(.iconOnly)
                }
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
            description: Text("Tap Add task — try \"report fri 5pm !1 #work\".")
        )
        .padding(.top, 80)
    }

    private func presentQuickAdd() {
        // Opening quick-add inside a project files into it by default; the sheet's
        // picker and a typed `#token` can still override.
        quickAddProjectID = project?.id
        showingQuickAdd = true
    }

    private func submit() {
        let text = quickAddText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        let reminderEnabled = quickAddReminderEnabled
        // The picked project, falling back to the pane's own — a `#project` in the
        // text still outranks both, resolved in `TaskService.create`.
        let selectedProject = projects.first { $0.id == quickAddProjectID } ?? project
        quickAddText = ""
        quickAddReminderEnabled = false
        quickAddProjectID = nil
        Task {
            await aiService.quickAdd(
                text,
                project: selectedProject,
                reminderEnabled: reminderEnabled
            )
        }
    }

    private func planDay() {
        showingPlan = true
        Task { await aiService.planDay() }
    }
}
