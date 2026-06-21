import Foundation
import Testing
@testable import TodoCore
@testable import TodoData

@MainActor
@Suite struct TaskServiceTests {
    private func service() -> TaskService {
        let container = TodoModelContainer.live(inMemory: true)
        return TaskService(context: container.mainContext)
    }

    @Test func createsTask() {
        let svc = service()
        let task = svc.create(TaskDraft(title: "Write tests", priority: .high))
        #expect(task.title == "Write tests")
        #expect(task.priority == .high)
        #expect(task.isCompleted == false)
    }

    @Test func togglesCompletion() {
        let svc = service()
        let task = svc.create(TaskDraft(title: "Toggle me"))
        svc.toggleCompletion(task)
        #expect(task.isCompleted)
        svc.toggleCompletion(task)
        #expect(!task.isCompleted)
    }

    @Test func todayIncludesDueTasks() {
        let svc = service()
        svc.create(TaskDraft(title: "Due now", dueDate: Date()))
        svc.create(TaskDraft(title: "No date"))
        #expect(svc.today().contains { $0.title == "Due now" })
        #expect(!svc.today().contains { $0.title == "No date" })
    }
}
