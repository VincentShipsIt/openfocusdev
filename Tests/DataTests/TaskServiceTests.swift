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
            tasks: TaskService(
                context: container.mainContext,
                reminderService: ReminderService(scheduler: NoopReminderScheduler())
            ),
            projects: ProjectService(context: container.mainContext)
        )
    }

    @Test func createsTask() async throws {
        let harness = try makeHarness()
        let task = await harness.tasks.create(
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

    @Test func updatesTask() async throws {
        let harness = try makeHarness()
        let task = await harness.tasks.create(TaskDraft(title: "Draft"))

        await harness.tasks.update(task) {
            $0.title = "Published"
            $0.priority = .urgent
        }

        #expect(task.title == "Published")
        #expect(task.priority == .urgent)
    }

    @Test func togglesCompletion() async throws {
        let harness = try makeHarness()
        let task = await harness.tasks.create(TaskDraft(title: "Toggle me"))

        await harness.tasks.toggleCompletion(task)
        #expect(task.isCompleted)

        await harness.tasks.toggleCompletion(task)
        #expect(!task.isCompleted)
    }

    @Test func deletesTask() async throws {
        let harness = try makeHarness()
        let task = await harness.tasks.create(TaskDraft(title: "Delete me"))

        await harness.tasks.delete(task)

        #expect(harness.tasks.allActive().isEmpty)
    }

    @Test func assignsSequentialOrder() async throws {
        let harness = try makeHarness()
        let first = await harness.tasks.create(TaskDraft(title: "First"))
        let second = await harness.tasks.create(TaskDraft(title: "Second"))

        #expect(first.order == 0)
        #expect(second.order == 1)
        #expect(harness.tasks.allActive().map(\.title) == ["First", "Second"])
    }

    @Test func materializesNextRecurrence() async throws {
        let harness = try makeHarness()
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0) ?? .current
        let dueDate = try #require(
            calendar.date(from: DateComponents(year: 2026, month: 7, day: 23, hour: 9))
        )
        let expectedNextDate = try #require(
            calendar.date(byAdding: .day, value: 1, to: dueDate)
        )
        let task = await harness.tasks.create(TaskDraft(title: "Daily", dueDate: dueDate))
        task.recurrence = RecurrenceRule(frequency: .daily)

        await harness.tasks.toggleCompletion(task)

        let nextTask = try #require(harness.tasks.allActive().first)
        #expect(nextTask.id != task.id)
        #expect(nextTask.title == task.title)
        #expect(nextTask.dueDate == expectedNextDate)
        #expect(nextTask.recurrence == task.recurrence)
    }

    @Test func maintainsProjectRelationship() async throws {
        let harness = try makeHarness()
        let project = harness.projects.create(name: "OpenFocus")
        let task = await harness.tasks.create(TaskDraft(title: "Ship beta"), project: project)

        #expect(task.project === project)
        #expect(project.tasks?.contains { $0 === task } == true)
        #expect(project.activeTaskCount == 1)
    }

    @Test func todayIncludesDueTasks() async throws {
        let harness = try makeHarness()
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0) ?? .current
        let now = try #require(
            calendar.date(from: DateComponents(year: 2026, month: 7, day: 23, hour: 12))
        )
        await harness.tasks.create(TaskDraft(title: "Due now", dueDate: now))
        await harness.tasks.create(TaskDraft(title: "No date"))

        let today = harness.tasks.today(now: now, calendar: calendar)

        #expect(today.contains { $0.title == "Due now" })
        #expect(!today.contains { $0.title == "No date" })
    }

    @Test func storesAreIsolated() async throws {
        let first = try makeHarness()
        let second = try makeHarness()
        await first.tasks.create(TaskDraft(title: "First store only"))

        #expect(first.container !== second.container)
        #expect(first.tasks.allActive().count == 1)
        #expect(second.tasks.allActive().isEmpty)
    }
}

private actor NoopReminderScheduler: ReminderNotificationScheduling {
    func authorizationStatus() async -> ReminderAuthorizationStatus {
        .denied
    }

    func requestAuthorization() async throws -> ReminderAuthorizationStatus {
        .denied
    }

    func schedule(_ request: ReminderNotificationRequest) async throws {}

    func pendingRequestIdentifiers() async -> Set<String> {
        []
    }

    func removePendingRequests(withIdentifiers identifiers: [String]) async {}
}
