import Foundation
import Testing
@testable import OpenFocusCore

@Suite struct TaskStatusTests {
    private let reference = Date(timeIntervalSince1970: 1_780_000_000)

    // MARK: - Ordering

    @Test func ordersColumnsLeftToRight() {
        #expect(TaskStatus.allCases == [.todo, .doing, .done])
        #expect(TaskStatus.todo < TaskStatus.doing)
        #expect(TaskStatus.doing < TaskStatus.done)
    }

    // MARK: - resolved(storedRaw:completedAt:)

    @Test func completionTimestampWins() {
        // A task completed from the list view never wrote `statusRaw`, so the
        // timestamp has to be what puts it in the Done column.
        #expect(TaskStatus.resolved(storedRaw: TaskStatus.todo.rawValue, completedAt: reference) == .done)
        #expect(TaskStatus.resolved(storedRaw: TaskStatus.doing.rawValue, completedAt: reference) == .done)
    }

    @Test func staleDoneWithoutTimestampDegradesToTodo() {
        // Un-completing from the list view clears `completedAt` but leaves the
        // stored column behind; the row belongs back in To Do.
        #expect(TaskStatus.resolved(storedRaw: TaskStatus.done.rawValue, completedAt: nil) == .todo)
    }

    @Test func preservesInProgressWhileIncomplete() {
        #expect(TaskStatus.resolved(storedRaw: TaskStatus.doing.rawValue, completedAt: nil) == .doing)
        #expect(TaskStatus.resolved(storedRaw: TaskStatus.todo.rawValue, completedAt: nil) == .todo)
    }

    @Test func unknownRawValueFallsBackToTodo() {
        // Rows written before `statusRaw` existed, or by a newer schema.
        #expect(TaskStatus.resolved(storedRaw: 99, completedAt: nil) == .todo)
        #expect(TaskStatus.resolved(storedRaw: -1, completedAt: nil) == .todo)
    }

    // MARK: - completionDate(from:now:)

    @Test func movingToDoneStampsCompletion() {
        #expect(TaskStatus.done.completionDate(from: nil, now: reference) == reference)
    }

    @Test func movingToDoneKeepsOriginalCompletionTime() {
        let original = reference.addingTimeInterval(-86_400)
        #expect(TaskStatus.done.completionDate(from: original, now: reference) == original)
    }

    @Test func movingOutOfDoneClearsCompletion() {
        #expect(TaskStatus.todo.completionDate(from: reference, now: reference) == nil)
        #expect(TaskStatus.doing.completionDate(from: reference, now: reference) == nil)
    }

    // MARK: - Round trip

    @Test func writeThenReadIsStable() {
        for status in TaskStatus.allCases {
            let completedAt = status.completionDate(from: nil, now: reference)
            #expect(TaskStatus.resolved(storedRaw: status.rawValue, completedAt: completedAt) == status)
        }
    }
}
