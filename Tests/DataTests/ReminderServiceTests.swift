import Foundation
import Testing
@testable import OpenFocusData

@MainActor
@Suite
struct ReminderServiceTests {
    @Test
    func identifierIsStableAndNamespaced() {
        let id = UUID(uuidString: "48CB1A0F-6C31-4CE6-AE36-99AF4047166B")!

        #expect(
            ReminderService.identifier(for: id)
                == "dev.openfocus.task-reminder.48CB1A0F-6C31-4CE6-AE36-99AF4047166B"
        )
    }

    @Test
    func refreshReadsCurrentAuthorization() async {
        let scheduler = MockReminderScheduler(status: .denied)
        let service = ReminderService(scheduler: scheduler)

        await service.refreshAuthorizationStatus()

        #expect(service.authorizationStatus == .denied)
    }

    @Test
    func enablingReminderRequestsAuthorizationAndSchedules() async {
        let dueDate = Date().addingTimeInterval(3_600)
        let scheduler = MockReminderScheduler(
            status: .notDetermined,
            requestedStatus: .authorized
        )
        let service = ReminderService(scheduler: scheduler)
        let reminder = ReminderSnapshot(
            id: UUID(),
            title: "Submit report",
            dueDate: dueDate,
            isEnabled: true,
            isCompleted: false
        )

        await service.synchronize(reminder, requestAuthorizationIfNeeded: true)
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.authorizationRequests == 1)
        #expect(snapshot.scheduled == [
            ReminderNotificationRequest(
                identifier: ReminderService.identifier(for: reminder.id),
                title: reminder.title,
                dueDate: dueDate
            ),
        ])
        #expect(service.authorizationStatus == .authorized)
        #expect(service.lastErrorMessage == nil)
    }

    @Test
    func deniedAuthorizationLeavesReminderUnscheduled() async {
        let scheduler = MockReminderScheduler(status: .denied)
        let service = ReminderService(scheduler: scheduler)
        let reminder = ReminderSnapshot(
            id: UUID(),
            title: "Call dentist",
            dueDate: Date().addingTimeInterval(3_600),
            isEnabled: true,
            isCompleted: false
        )

        await service.synchronize(reminder, requestAuthorizationIfNeeded: true)
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.authorizationRequests == 0)
        #expect(snapshot.scheduled.isEmpty)
        #expect(snapshot.removed == [ReminderService.identifier(for: reminder.id)])
        #expect(service.authorizationStatus == .denied)
    }

    @Test
    func authorizationFailureIsRecoverable() async {
        let scheduler = MockReminderScheduler(
            status: .notDetermined,
            requestShouldFail: true
        )
        let service = ReminderService(scheduler: scheduler)
        let reminder = ReminderSnapshot(
            id: UUID(),
            title: "Call dentist",
            dueDate: Date().addingTimeInterval(3_600),
            isEnabled: true,
            isCompleted: false
        )

        await service.synchronize(reminder, requestAuthorizationIfNeeded: true)
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.authorizationRequests == 1)
        #expect(snapshot.scheduled.isEmpty)
        #expect(service.lastErrorMessage != nil)
    }

    @Test
    func provisionalAuthorizationSchedulesWithoutPrompting() async {
        let scheduler = MockReminderScheduler(status: .provisional)
        let service = ReminderService(scheduler: scheduler)
        let reminder = ReminderSnapshot(
            id: UUID(),
            title: "Pack bag",
            dueDate: Date().addingTimeInterval(3_600),
            isEnabled: true,
            isCompleted: false
        )

        await service.synchronize(reminder, requestAuthorizationIfNeeded: true)
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.authorizationRequests == 0)
        #expect(snapshot.scheduled.count == 1)
        #expect(service.authorizationStatus == .provisional)
    }

    @Test
    func disablingReminderCancelsWithoutPrompting() async {
        let taskID = UUID()
        let identifier = ReminderService.identifier(for: taskID)
        let scheduler = MockReminderScheduler(
            status: .notDetermined,
            pendingIdentifiers: [identifier]
        )
        let service = ReminderService(scheduler: scheduler)
        let reminder = ReminderSnapshot(
            id: taskID,
            title: "Pack bag",
            dueDate: Date().addingTimeInterval(3_600),
            isEnabled: false,
            isCompleted: false
        )

        await service.synchronize(reminder, requestAuthorizationIfNeeded: false)
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.authorizationRequests == 0)
        #expect(snapshot.scheduled.isEmpty)
        #expect(snapshot.removed == [identifier])
    }

    @Test
    func editingDueDateReschedulesTheStableRequest() async {
        let taskID = UUID()
        let firstDate = Date().addingTimeInterval(3_600)
        let secondDate = firstDate.addingTimeInterval(1_800)
        let scheduler = MockReminderScheduler(status: .authorized)
        let service = ReminderService(scheduler: scheduler)

        await service.synchronize(
            ReminderSnapshot(
                id: taskID,
                title: "Pack bag",
                dueDate: firstDate,
                isEnabled: true,
                isCompleted: false
            ),
            requestAuthorizationIfNeeded: false
        )
        await service.synchronize(
            ReminderSnapshot(
                id: taskID,
                title: "Pack bag",
                dueDate: secondDate,
                isEnabled: true,
                isCompleted: false
            ),
            requestAuthorizationIfNeeded: false
        )
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.scheduled.count == 2)
        #expect(snapshot.scheduled.map(\.identifier) == [
            ReminderService.identifier(for: taskID),
            ReminderService.identifier(for: taskID),
        ])
        #expect(snapshot.scheduled.map(\.dueDate) == [firstDate, secondDate])
    }

    @Test
    func deletingTaskCancelsItsStableRequest() async {
        let taskID = UUID()
        let scheduler = MockReminderScheduler(status: .authorized)
        let service = ReminderService(scheduler: scheduler)

        await service.remove(taskID: taskID)
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.removed == [ReminderService.identifier(for: taskID)])
    }

    @Test
    func schedulingFailureIsRecoverable() async {
        let scheduler = MockReminderScheduler(
            status: .authorized,
            scheduleShouldFail: true
        )
        let service = ReminderService(scheduler: scheduler)
        let reminder = ReminderSnapshot(
            id: UUID(),
            title: "Pack bag",
            dueDate: Date().addingTimeInterval(3_600),
            isEnabled: true,
            isCompleted: false
        )

        await service.synchronize(reminder, requestAuthorizationIfNeeded: false)

        #expect(service.lastErrorMessage != nil)
    }

    @Test
    func launchReconciliationDoesNotRequestAuthorization() async {
        let active = ReminderSnapshot(
            id: UUID(),
            title: "Future task",
            dueDate: Date().addingTimeInterval(7_200),
            isEnabled: true,
            isCompleted: false
        )
        let staleIdentifier = ReminderService.identifier(for: UUID())
        let scheduler = MockReminderScheduler(
            status: .notDetermined,
            pendingIdentifiers: [
                ReminderService.identifier(for: active.id),
                staleIdentifier,
            ]
        )
        let service = ReminderService(scheduler: scheduler)

        await service.reconcile([active])
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.authorizationRequests == 0)
        #expect(snapshot.scheduled.isEmpty)
        #expect(Set(snapshot.removed) == [
            ReminderService.identifier(for: active.id),
            staleIdentifier,
        ])
    }

    @Test
    func reconciliationReplacesDesiredAndRemovesStaleRequests() async {
        let active = ReminderSnapshot(
            id: UUID(),
            title: "Future task",
            dueDate: Date().addingTimeInterval(7_200),
            isEnabled: true,
            isCompleted: false
        )
        let completed = ReminderSnapshot(
            id: UUID(),
            title: "Completed task",
            dueDate: Date().addingTimeInterval(7_200),
            isEnabled: true,
            isCompleted: true
        )
        let scheduler = MockReminderScheduler(
            status: .authorized,
            pendingIdentifiers: [
                ReminderService.identifier(for: completed.id),
                "unrelated.notification",
            ]
        )
        let service = ReminderService(scheduler: scheduler)

        await service.reconcile([active, completed])
        let snapshot = await scheduler.snapshot()

        #expect(snapshot.scheduled.map(\.identifier) == [
            ReminderService.identifier(for: active.id),
        ])
        #expect(snapshot.removed == [
            ReminderService.identifier(for: completed.id),
        ])
    }
}

private actor MockReminderScheduler: ReminderNotificationScheduling {
    struct Snapshot: Sendable {
        let authorizationRequests: Int
        let scheduled: [ReminderNotificationRequest]
        let removed: [String]
    }

    private var status: ReminderAuthorizationStatus
    private let requestedStatus: ReminderAuthorizationStatus
    private let requestShouldFail: Bool
    private let scheduleShouldFail: Bool
    private var authorizationRequests = 0
    private var scheduled: [ReminderNotificationRequest] = []
    private var removed: [String] = []
    private var pendingIdentifiers: Set<String>

    init(
        status: ReminderAuthorizationStatus,
        requestedStatus: ReminderAuthorizationStatus = .denied,
        requestShouldFail: Bool = false,
        scheduleShouldFail: Bool = false,
        pendingIdentifiers: Set<String> = []
    ) {
        self.status = status
        self.requestedStatus = requestedStatus
        self.requestShouldFail = requestShouldFail
        self.scheduleShouldFail = scheduleShouldFail
        self.pendingIdentifiers = pendingIdentifiers
    }

    func authorizationStatus() async -> ReminderAuthorizationStatus {
        status
    }

    func requestAuthorization() async throws -> ReminderAuthorizationStatus {
        authorizationRequests += 1
        if requestShouldFail {
            throw MockError.failed
        }
        status = requestedStatus
        return status
    }

    func schedule(_ request: ReminderNotificationRequest) async throws {
        if scheduleShouldFail {
            throw MockError.failed
        }
        scheduled.append(request)
        pendingIdentifiers.insert(request.identifier)
    }

    func pendingRequestIdentifiers() async -> Set<String> {
        pendingIdentifiers
    }

    func removePendingRequests(withIdentifiers identifiers: [String]) async {
        removed.append(contentsOf: identifiers)
        pendingIdentifiers.subtract(identifiers)
    }

    func snapshot() -> Snapshot {
        Snapshot(
            authorizationRequests: authorizationRequests,
            scheduled: scheduled,
            removed: removed
        )
    }
}

private enum MockError: Error {
    case failed
}
