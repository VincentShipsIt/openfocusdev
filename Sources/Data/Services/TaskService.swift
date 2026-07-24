import Foundation
import SwiftData
import OpenFocusCore

/// CRUD + queries for tasks, bound to the main `ModelContext`. `@Observable` so
/// SwiftUI views re-render on mutation; `@MainActor` because it touches the UI
/// context.
@MainActor
@Observable
public final class TaskService {
    private let context: ModelContext
    private let reminderService: ReminderService

    public init(context: ModelContext, reminderService: ReminderService) {
        self.context = context
        self.reminderService = reminderService
    }

    // MARK: - Create

    @discardableResult
    public func create(
        _ draft: TaskDraft,
        project: Project? = nil,
        reminderEnabled: Bool = false
    ) async -> TodoTask {
        let task = TodoTask(
            title: draft.title,
            notes: draft.notes,
            dueDate: draft.dueDate,
            reminderEnabled: reminderEnabled && draft.dueDate != nil,
            priority: draft.priority,
            labels: draft.labels,
            order: nextOrder()
        )
        task.project = project
        context.insert(task)
        save()
        await reminderService.synchronize(
            reminderSnapshot(for: task),
            requestAuthorizationIfNeeded: task.reminderEnabled
        )
        return task
    }

    // MARK: - Mutate

    public func toggleCompletion(_ task: TodoTask) async {
        task.toggleCompletion()
        var nextOccurrence: TodoTask?

        // Materialize the next occurrence of a recurring task on completion.
        if task.isCompleted,
           let rule = task.recurrence,
           let due = task.dueDate,
           let next = rule.nextDate(after: due) {
            let copy = TodoTask(
                title: task.title,
                notes: task.notes,
                dueDate: next,
                reminderEnabled: task.reminderEnabled,
                priority: task.priority,
                labels: task.labels,
                order: task.order
            )
            copy.project = task.project
            copy.recurrence = rule
            context.insert(copy)
            nextOccurrence = copy
        }
        save()
        await reminderService.synchronize(
            reminderSnapshot(for: task),
            requestAuthorizationIfNeeded: false
        )
        if let nextOccurrence {
            await reminderService.synchronize(
                reminderSnapshot(for: nextOccurrence),
                requestAuthorizationIfNeeded: false
            )
        }
    }

    public func update(_ task: TodoTask, _ mutate: (TodoTask) -> Void) async {
        let wasReminderEnabled = task.reminderEnabled
        mutate(task)
        if task.dueDate == nil {
            task.reminderEnabled = false
        }
        task.updatedAt = Date()
        save()
        await reminderService.synchronize(
            reminderSnapshot(for: task),
            requestAuthorizationIfNeeded: !wasReminderEnabled && task.reminderEnabled
        )
    }

    public func setReminderEnabled(_ enabled: Bool, for task: TodoTask) async {
        task.reminderEnabled = enabled && task.dueDate != nil
        task.updatedAt = Date()
        save()
        await reminderService.synchronize(
            reminderSnapshot(for: task),
            requestAuthorizationIfNeeded: task.reminderEnabled
        )
    }

    public func delete(_ task: TodoTask) async {
        let taskID = task.id
        context.delete(task)
        save()
        await reminderService.remove(taskID: taskID)
    }

    public func reconcileReminders() async {
        await reminderService.reconcile(allTasks().map(reminderSnapshot(for:)))
    }

    // MARK: - Fetch

    /// Top-level (non-subtask) incomplete tasks, ordered. Filtering/sorting is done
    /// in Swift (personal-scale data) to keep the store query Sendable-clean.
    public func allActive() -> [TodoTask] {
        allTasks()
            .filter { $0.completedAt == nil && $0.parent == nil }
            .sorted { $0.order < $1.order }
    }

    private func allTasks() -> [TodoTask] {
        (try? context.fetch(FetchDescriptor<TodoTask>())) ?? []
    }

    /// Tasks due today or overdue.
    public func today(now: Date = Date(), calendar: Calendar = .current) -> [TodoTask] {
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: now) ?? now
        let endOfToday = calendar.startOfDay(for: tomorrow)
        return allActive().filter { task in
            guard let due = task.dueDate else { return false }
            return due < endOfToday
        }
    }

    // MARK: - Internals

    private func nextOrder() -> Int {
        (allTasks().map(\.order).max() ?? -1) + 1
    }

    private func reminderSnapshot(for task: TodoTask) -> ReminderSnapshot {
        ReminderSnapshot(
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            isEnabled: task.reminderEnabled,
            isCompleted: task.isCompleted
        )
    }

    private func save() {
        try? context.save()
    }
}
