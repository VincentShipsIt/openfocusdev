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

    public init(context: ModelContext) {
        self.context = context
    }

    // MARK: - Create

    @discardableResult
    public func create(_ draft: TaskDraft, project: Project? = nil) -> TodoTask {
        let task = TodoTask(
            title: draft.title,
            notes: draft.notes,
            dueDate: draft.dueDate,
            priority: draft.priority,
            labels: draft.labels,
            order: nextOrder()
        )
        task.project = project
        context.insert(task)
        save()
        return task
    }

    // MARK: - Mutate

    public func toggleCompletion(_ task: TodoTask) {
        task.toggleCompletion()
        materializeNextOccurrence(of: task)
        save()
    }

    /// Move a task between board columns. `order` is deliberately left alone so a
    /// column change never reshuffles the shared list ordering.
    public func move(_ task: TodoTask, to status: TaskStatus) {
        guard task.status != status else { return }
        task.status = status
        task.updatedAt = Date()
        materializeNextOccurrence(of: task)
        save()
    }

    public func update(_ task: TodoTask, _ mutate: (TodoTask) -> Void) {
        mutate(task)
        task.updatedAt = Date()
        save()
    }

    public func delete(_ task: TodoTask) {
        context.delete(task)
        save()
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

    /// Materialize the next occurrence of a recurring task once it lands in Done.
    /// Shared by the list checkmark and the board drop so both behave identically.
    private func materializeNextOccurrence(of task: TodoTask) {
        guard task.isCompleted,
              let rule = task.recurrence,
              let due = task.dueDate,
              let next = rule.nextDate(after: due) else { return }
        let copy = TodoTask(
            title: task.title,
            notes: task.notes,
            dueDate: next,
            priority: task.priority,
            labels: task.labels,
            order: task.order
        )
        copy.project = task.project
        copy.recurrence = rule
        context.insert(copy)
    }

    private func nextOrder() -> Int {
        (allTasks().map(\.order).max() ?? -1) + 1
    }

    private func save() {
        try? context.save()
    }
}
