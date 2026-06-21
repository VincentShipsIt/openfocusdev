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
