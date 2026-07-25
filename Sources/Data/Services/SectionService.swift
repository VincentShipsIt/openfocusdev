import Foundation
import SwiftData

/// CRUD + ordering for sections within a project, bound to the main `ModelContext`.
/// Mirrors `ProjectService`'s shape (`@MainActor @Observable`, best-effort `save()`).
@MainActor
@Observable
public final class SectionService {
    private let context: ModelContext

    public init(context: ModelContext) {
        self.context = context
    }

    // MARK: - Create / rename

    @discardableResult
    public func create(name: String, in project: Project) -> ProjectSection {
        let section = ProjectSection(name: name, order: nextOrder(in: project))
        section.project = project
        context.insert(section)
        save()
        return section
    }

    public func rename(_ section: ProjectSection, to name: String) {
        section.name = name
        save()
    }

    // MARK: - Ordering

    /// Reindex a project's sections to the given order. Callers pass the full
    /// desired sequence (e.g. the result of a SwiftUI `onMove`); we write
    /// contiguous `order` values so later inserts stay stable.
    public func reorder(_ ordered: [ProjectSection]) {
        for (index, section) in ordered.enumerated() where section.order != index {
            section.order = index
        }
        save()
    }

    // MARK: - Archive / restore

    public func archive(_ section: ProjectSection) {
        guard !section.isArchived else { return }
        section.isArchived = true
        save()
    }

    public func restore(_ section: ProjectSection) {
        guard section.isArchived else { return }
        section.isArchived = false
        save()
    }

    // MARK: - Delete

    /// Delete a section without losing its tasks: each task is detached from the
    /// section (staying in the owning project's unsectioned area) before the
    /// section is removed. Task `order`, project link, labels, recurrence, and
    /// subtasks are untouched.
    public func delete(_ section: ProjectSection) {
        for task in section.tasks ?? [] {
            task.section = nil
        }
        context.delete(section)
        save()
    }

    // MARK: - Fetch

    /// Non-archived sections for a project, in display order.
    public func sections(in project: Project) -> [ProjectSection] {
        (project.sections ?? [])
            .filter { !$0.isArchived }
            .sorted { $0.order < $1.order }
    }

    // MARK: - Helpers

    private func nextOrder(in project: Project) -> Int {
        ((project.sections ?? []).map(\.order).max() ?? -1) + 1
    }

    private func save() {
        try? context.save()
    }
}
