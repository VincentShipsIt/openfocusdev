import Foundation
import Testing
import SwiftData
@testable import OpenFocusCore
@testable import OpenFocusData

@MainActor
@Suite
struct TaskServiceTests {
    private struct Harness {
        let container: ModelContainer
        let tasks: TaskService
        let projects: ProjectService
    }

    private func makeHarness() throws -> Harness {
        let container = try OpenFocusModelContainer.make(inMemory: true)
        return Harness(
            container: container,
            tasks: TaskService(context: container.mainContext),
            projects: ProjectService(context: container.mainContext)
        )
    }

    @Test func createsTask() throws {
        let harness = try makeHarness()
        let task = harness.tasks.create(
            TaskDraft(
                title: "Write tests",
                notes: "Cover SwiftData",
                priority: .high,
                labels: ["testing"]
            )
        )

        #expect(task.title == "Write tests")
        #expect(task.notes == "Cover SwiftData")
        #expect(task.priority == .high)
        #expect(task.labels == ["testing"])
        #expect(!task.isCompleted)
    }

    @Test func updatesTask() throws {
        let harness = try makeHarness()
        let task = harness.tasks.create(TaskDraft(title: "Draft"))

        harness.tasks.update(task) {
            $0.title = "Published"
            $0.priority = .urgent
        }

        #expect(task.title == "Published")
        #expect(task.priority == .urgent)
    }

    @Test func togglesCompletion() throws {
        let harness = try makeHarness()
        let task = harness.tasks.create(TaskDraft(title: "Toggle me"))

        harness.tasks.toggleCompletion(task)
        #expect(task.isCompleted)

        harness.tasks.toggleCompletion(task)
        #expect(!task.isCompleted)
    }

    @Test func deletesTask() throws {
        let harness = try makeHarness()
        let task = harness.tasks.create(TaskDraft(title: "Delete me"))

        harness.tasks.delete(task)

        #expect(harness.tasks.allActive().isEmpty)
    }

    @Test func assignsSequentialOrder() throws {
        let harness = try makeHarness()
        let first = harness.tasks.create(TaskDraft(title: "First"))
        let second = harness.tasks.create(TaskDraft(title: "Second"))

        #expect(first.order == 0)
        #expect(second.order == 1)
        #expect(harness.tasks.allActive().map(\.title) == ["First", "Second"])
    }

    @Test func materializesNextRecurrence() throws {
        let harness = try makeHarness()
        let calendar = Calendar(identifier: .gregorian)
        let dueDate = try #require(
            calendar.date(from: DateComponents(year: 2026, month: 7, day: 23, hour: 9))
        )
        let expectedNextDate = try #require(
            calendar.date(byAdding: .day, value: 1, to: dueDate)
        )
        let task = harness.tasks.create(TaskDraft(title: "Daily", dueDate: dueDate))
        task.recurrence = RecurrenceRule(frequency: .daily)

        harness.tasks.toggleCompletion(task)

        let nextTask = try #require(harness.tasks.allActive().first)
        #expect(nextTask.id != task.id)
        #expect(nextTask.title == task.title)
        #expect(nextTask.dueDate == expectedNextDate)
        #expect(nextTask.recurrence == task.recurrence)
    }

    @Test func maintainsProjectRelationship() throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "OpenFocus")
        let task = harness.tasks.create(TaskDraft(title: "Ship beta"), project: project)

        #expect(task.project === project)
        #expect(project.tasks?.contains { $0 === task } == true)
        #expect(project.activeTaskCount == 1)
    }

    @Test func todayIncludesDueTasks() throws {
        let harness = try makeHarness()
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0) ?? .current
        let now = try #require(
            calendar.date(from: DateComponents(year: 2026, month: 7, day: 23, hour: 12))
        )
        harness.tasks.create(TaskDraft(title: "Due now", dueDate: now))
        harness.tasks.create(TaskDraft(title: "No date"))

        let today = harness.tasks.today(now: now, calendar: calendar)

        #expect(today.contains { $0.title == "Due now" })
        #expect(!today.contains { $0.title == "No date" })
    }

    @Test func storesAreIsolated() throws {
        let first = try makeHarness()
        let second = try makeHarness()
        first.tasks.create(TaskDraft(title: "First store only"))

        #expect(first.container !== second.container)
        #expect(first.tasks.allActive().count == 1)
        #expect(second.tasks.allActive().isEmpty)
    }
}
