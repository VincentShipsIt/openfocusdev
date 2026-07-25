import Foundation
import Testing
import SwiftData
@testable import OpenFocusCore
@testable import OpenFocusData

@MainActor
@Suite
struct SectionServiceTests {
    private struct Harness {
        let container: ModelContainer
        let tasks: TaskService
        let projects: ProjectService
        let sections: SectionService
    }

    private func makeHarness() throws -> Harness {
        let container = try OpenFocusModelContainer.make(inMemory: true)
        let context = container.mainContext
        // Projects first: `TaskService` resolves a typed `#project` through it.
        let projects = ProjectService(context: context)
        return Harness(
            container: container,
            tasks: TaskService(
                context: context,
                reminderService: ReminderService(scheduler: NoopReminderScheduler()),
                projectService: projects
            ),
            projects: projects,
            sections: SectionService(context: context)
        )
    }

    @Test func createsSectionWithinProject() throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")

        let section = harness.sections.create(name: "Planning", in: project)

        #expect(section.name == "Planning")
        #expect(section.order == 0)
        #expect(section.project?.id == project.id)
        #expect((project.sections ?? []).contains { $0.id == section.id })
    }

    @Test func assignsSequentialOrder() throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")

        let first = harness.sections.create(name: "Planning", in: project)
        let second = harness.sections.create(name: "In Review", in: project)

        #expect(first.order == 0)
        #expect(second.order == 1)
    }

    @Test func renamesSection() throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")
        let section = harness.sections.create(name: "Planning", in: project)

        harness.sections.rename(section, to: "Discovery")

        #expect(section.name == "Discovery")
    }

    @Test func reorderReindexesContiguously() throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")
        let a = harness.sections.create(name: "A", in: project)
        let b = harness.sections.create(name: "B", in: project)
        let c = harness.sections.create(name: "C", in: project)

        harness.sections.reorder([c, a, b])

        #expect(c.order == 0)
        #expect(a.order == 1)
        #expect(b.order == 2)
    }

    @Test func archiveHidesFromActiveListAndRestoreBringsBack() throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")
        let active = harness.sections.create(name: "Active", in: project)
        let shelved = harness.sections.create(name: "Shelved", in: project)

        harness.sections.archive(shelved)
        #expect(shelved.isArchived)
        #expect(harness.sections.sections(in: project).map(\.id) == [active.id])

        harness.sections.restore(shelved)
        #expect(!shelved.isArchived)
        #expect(harness.sections.sections(in: project).count == 2)
    }

    @Test func deletePreservesTasksInOwningProject() async throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")
        let section = harness.sections.create(name: "Planning", in: project)
        let task = await harness.tasks.create(TaskDraft(title: "Scope it"), project: project)
        harness.projects.moveTask(task, toSection: section)
        #expect(task.section?.id == section.id)

        harness.sections.delete(section)

        // Task survives, stays in the project, and is now unsectioned.
        #expect(task.section == nil)
        #expect(task.project?.id == project.id)
        let remaining = try harness.container.mainContext.fetch(FetchDescriptor<TodoTask>())
        #expect(remaining.contains { $0.id == task.id })
    }

    @Test func sectionsQueryExcludesArchivedAndSorts() throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")
        let a = harness.sections.create(name: "A", in: project)
        let b = harness.sections.create(name: "B", in: project)
        harness.sections.reorder([b, a])
        harness.sections.archive(a)

        #expect(harness.sections.sections(in: project).map(\.name) == ["B"])
    }
}
