import Foundation
import Testing
import SwiftData
@testable import OpenFocusCore
@testable import OpenFocusData

@MainActor
@Suite
struct ProjectHierarchyTests {
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

    /// Build a parent→child chain of the given length, returning the deepest node.
    private func makeChain(_ length: Int, projects: ProjectService) -> Project {
        var node = projects.create(name: "L1")
        guard length > 1 else { return node }
        for level in 2...length {
            node = projects.createSubproject(name: "L\(level)", under: node)!
        }
        return node
    }

    // MARK: - Nesting

    @Test func createsSubprojectUnderParent() throws {
        let harness = try makeHarness()
        let parent = harness.projects.create(name: "Work")

        let child = harness.projects.createSubproject(name: "Q3", under: parent)

        #expect(child != nil)
        #expect(child?.parent?.id == parent.id)
        #expect(child?.depth == 2)
        #expect(parent.sortedSubprojects.map(\.id) == [child!.id])
    }

    @Test func depthCountsUpTheParentChain() throws {
        let harness = try makeHarness()
        let root = harness.projects.create(name: "Root")
        let child = harness.projects.createSubproject(name: "Child", under: root)!
        let grandchild = harness.projects.createSubproject(name: "Grandchild", under: child)!

        #expect(root.depth == 1)
        #expect(child.depth == 2)
        #expect(grandchild.depth == 3)
    }

    @Test func refusesToNestBeyondMaxDepth() throws {
        let harness = try makeHarness()
        let deepest = makeChain(Project.maxNestingDepth, projects: harness.projects)
        #expect(deepest.depth == Project.maxNestingDepth)
        #expect(!harness.projects.canNest(under: deepest))

        let rejected = harness.projects.createSubproject(name: "TooDeep", under: deepest)

        #expect(rejected == nil)
        #expect((deepest.subprojects ?? []).isEmpty)
    }

    @Test func subprojectsAreSiblingOrdered() throws {
        let harness = try makeHarness()
        let parent = harness.projects.create(name: "Work")
        let a = harness.projects.createSubproject(name: "A", under: parent)!
        let b = harness.projects.createSubproject(name: "B", under: parent)!

        #expect(a.order == 0)
        #expect(b.order == 1)
    }

    // MARK: - Ordering / archive / favorites

    @Test func reorderReindexesContiguously() throws {
        let harness = try makeHarness()
        let a = harness.projects.create(name: "A")
        let b = harness.projects.create(name: "B")
        let c = harness.projects.create(name: "C")

        harness.projects.reorder([c, a, b])

        #expect(c.order == 0)
        #expect(a.order == 1)
        #expect(b.order == 2)
    }

    @Test func rootsExcludeArchivedAndChildren() throws {
        let harness = try makeHarness()
        let visible = harness.projects.create(name: "Visible")
        let archived = harness.projects.create(name: "Archived")
        _ = harness.projects.createSubproject(name: "Child", under: visible)!
        harness.projects.archive(archived)

        #expect(harness.projects.roots().map(\.id) == [visible.id])
    }

    @Test func favoritesToggleAndListing() throws {
        let harness = try makeHarness()
        let starred = harness.projects.create(name: "Starred")
        _ = harness.projects.create(name: "Plain")

        harness.projects.toggleFavorite(starred)
        #expect(starred.isFavorite)
        #expect(harness.projects.favorites().map(\.id) == [starred.id])

        harness.projects.setFavorite(starred, false)
        #expect(harness.projects.favorites().isEmpty)
    }

    // MARK: - Moving tasks

    @Test func moveToProjectPreservesRecurrenceLabelsAndSubtasks() async throws {
        let harness = try makeHarness()
        let source = harness.projects.create(name: "Source")
        let destination = harness.projects.create(name: "Destination")
        let task = await harness.tasks.create(
            TaskDraft(title: "Ship", labels: ["release"]),
            project: source
        )
        task.recurrence = RecurrenceRule(frequency: .weekly)
        let subtask = TodoTask(title: "Subtask")
        subtask.parent = task
        harness.container.mainContext.insert(subtask)
        let originalOrder = task.order

        harness.projects.moveTask(task, to: destination)

        #expect(task.project?.id == destination.id)
        #expect(task.section == nil)
        #expect(task.order == originalOrder)
        #expect(task.labels == ["release"])
        #expect(task.recurrence == RecurrenceRule(frequency: .weekly))
        #expect((task.subtasks ?? []).map(\.id) == [subtask.id])
    }

    @Test func moveToSectionAdoptsTheSectionsProject() async throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")
        let section = harness.sections.create(name: "Planning", in: project)
        let task = await harness.tasks.create(TaskDraft(title: "Scope"))

        harness.projects.moveTask(task, toSection: section)

        #expect(task.project?.id == project.id)
        #expect(task.section?.id == section.id)
    }

    @Test func moveToInboxClearsProjectAndSection() async throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "Launch")
        let section = harness.sections.create(name: "Planning", in: project)
        let task = await harness.tasks.create(TaskDraft(title: "Scope"), project: project)
        harness.projects.moveTask(task, toSection: section)

        harness.projects.moveTaskToInbox(task)

        #expect(task.project == nil)
        #expect(task.section == nil)
    }

    @Test func moveIgnoresSectionFromADifferentProject() async throws {
        let harness = try makeHarness()
        let projectA = harness.projects.create(name: "A")
        let projectB = harness.projects.create(name: "B")
        let sectionA = harness.sections.create(name: "A-Section", in: projectA)
        let task = await harness.tasks.create(TaskDraft(title: "Scope"))

        // Ask to move into project B but with a section that belongs to A.
        harness.projects.moveTask(task, to: projectB, section: sectionA)

        #expect(task.project?.id == projectB.id)
        #expect(task.section == nil)
    }
}
