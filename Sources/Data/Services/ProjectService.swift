import Foundation
import SwiftData

/// CRUD + queries for projects, bound to the main `ModelContext`.
@MainActor
@Observable
public final class ProjectService {
    private let context: ModelContext

    public init(context: ModelContext) {
        self.context = context
    }

    @discardableResult
    public func create(
        name: String,
        colorHex: String = "#DC4C3E",
        symbol: String = "number"
    ) -> Project {
        let project = Project(name: name, colorHex: colorHex, symbol: symbol, order: nextOrder())
        context.insert(project)
        save()
        return project
    }

    /// Resolve a typed `#project` token to a real project, creating one on a miss.
    ///
    /// Matching is case-insensitive so "#Work" and "#work" don't end up as two
    /// projects, and creating on a miss is the point of the syntax — `#reading`
    /// should file the task without a detour through the project sheet. Returns
    /// nil only for a blank name, which is what a bare `#` produces.
    ///
    /// An archived match is restored rather than shadowed by a new project: two
    /// projects sharing a name would make every later `#work` ambiguous, and
    /// filing into a hidden project would make the task look lost.
    @discardableResult
    public func findOrCreate(named name: String) -> Project? {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return nil }

        let matches = allProjects().filter {
            $0.name.localizedCaseInsensitiveCompare(trimmed) == .orderedSame
        }
        guard let existing = matches.first(where: { !$0.isArchived }) ?? matches.first else {
            return create(name: trimmed)
        }
        restore(existing)
        return existing
    }

    /// Create a nested project under `parent`. Returns `nil` — creating nothing —
    /// when `parent` is already at the deepest supported level, so the caller can
    /// surface "can't nest any deeper" instead of silently building an invalid tree.
    @discardableResult
    public func createSubproject(
        name: String,
        under parent: Project,
        colorHex: String = "#DC4C3E",
        symbol: String = "number"
    ) -> Project? {
        guard canNest(under: parent) else { return nil }
        let project = Project(
            name: name,
            colorHex: colorHex,
            symbol: symbol,
            order: nextSiblingOrder(under: parent)
        )
        project.parent = parent
        context.insert(project)
        save()
        return project
    }

    /// Whether a new child may be nested under `parent` without exceeding
    /// `Project.maxNestingDepth`.
    public func canNest(under parent: Project) -> Bool {
        parent.depth < Project.maxNestingDepth
    }

    public func rename(_ project: Project, to name: String) {
        project.name = name
        save()
    }

    public func delete(_ project: Project) {
        context.delete(project)
        save()
    }

    // MARK: - Ordering

    /// Reindex a sibling group (roots, or one parent's children) to the given
    /// order. Callers pass the full desired sequence (e.g. a SwiftUI `onMove`).
    public func reorder(_ ordered: [Project]) {
        for (index, project) in ordered.enumerated() where project.order != index {
            project.order = index
        }
        save()
    }

    // MARK: - Archive / restore / favorite

    public func archive(_ project: Project) {
        guard !project.isArchived else { return }
        project.isArchived = true
        save()
    }

    public func restore(_ project: Project) {
        guard project.isArchived else { return }
        project.isArchived = false
        save()
    }

    public func setFavorite(_ project: Project, _ isFavorite: Bool) {
        guard project.isFavorite != isFavorite else { return }
        project.isFavorite = isFavorite
        save()
    }

    public func toggleFavorite(_ project: Project) {
        setFavorite(project, !project.isFavorite)
    }

    // MARK: - Move tasks

    /// Move a task into a project (or the Inbox when `project` is nil) and,
    /// optionally, a section within it. A section whose owning project doesn't
    /// match `project` is ignored, so a task can never sit in a section that
    /// belongs to a different project. Task `order`, labels, recurrence, and
    /// subtasks are left untouched, so nothing is lost by the move.
    public func moveTask(_ task: TodoTask, to project: Project?, section: ProjectSection? = nil) {
        let resolvedSection = (section?.project?.id == project?.id) ? section : nil
        task.project = project
        task.section = resolvedSection
        task.updatedAt = Date()
        save()
    }

    public func moveTask(_ task: TodoTask, toSection section: ProjectSection) {
        moveTask(task, to: section.project, section: section)
    }

    public func moveTaskToInbox(_ task: TodoTask) {
        moveTask(task, to: nil)
    }

    // MARK: - Fetch

    public func all() -> [Project] {
        allProjects().sorted { $0.order < $1.order }
    }

    /// Top-level, non-archived projects in display order.
    public func roots() -> [Project] {
        allProjects()
            .filter { $0.parent == nil && !$0.isArchived }
            .sorted { $0.order < $1.order }
    }

    /// Non-archived children of `parent` in display order.
    public func children(of parent: Project) -> [Project] {
        parent.sortedSubprojects
    }

    /// Favorited, non-archived projects in display order.
    public func favorites() -> [Project] {
        allProjects()
            .filter { $0.isFavorite && !$0.isArchived }
            .sorted { $0.order < $1.order }
    }

    private func allProjects() -> [Project] {
        (try? context.fetch(FetchDescriptor<Project>())) ?? []
    }

    private func nextOrder() -> Int {
        (allProjects().map(\.order).max() ?? -1) + 1
    }

    private func nextSiblingOrder(under parent: Project) -> Int {
        ((parent.subprojects ?? []).map(\.order).max() ?? -1) + 1
    }

    private func save() {
        try? context.save()
    }
}
