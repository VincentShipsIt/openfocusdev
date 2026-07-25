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
    @discardableResult
    public func findOrCreate(named name: String) -> Project? {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return nil }

        let existing = allProjects().first {
            $0.name.localizedCaseInsensitiveCompare(trimmed) == .orderedSame
        }
        return existing ?? create(name: trimmed)
    }

    public func delete(_ project: Project) {
        context.delete(project)
        save()
    }

    public func all() -> [Project] {
        allProjects().sorted { $0.order < $1.order }
    }

    private func allProjects() -> [Project] {
        (try? context.fetch(FetchDescriptor<Project>())) ?? []
    }

    private func nextOrder() -> Int {
        (allProjects().map(\.order).max() ?? -1) + 1
    }

    private func save() {
        try? context.save()
    }
}
