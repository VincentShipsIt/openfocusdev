import Foundation
import Observation
import UserNotifications

private let reminderIdentifierPrefix = "dev.openfocus.task-reminder."

public enum ReminderAuthorizationStatus: String, Sendable, Equatable {
    case notDetermined
    case denied
    case authorized
    case provisional
    case ephemeral

    public var allowsScheduling: Bool {
        switch self {
        case .authorized, .provisional, .ephemeral:
            true
        case .notDetermined, .denied:
            false
        }
    }
}

public struct ReminderNotificationRequest: Sendable, Equatable {
    public let identifier: String
    public let title: String
    public let dueDate: Date

    public init(identifier: String, title: String, dueDate: Date) {
        self.identifier = identifier
        self.title = title
        self.dueDate = dueDate
    }
}

public struct ReminderSnapshot: Sendable, Equatable {
    public let id: UUID
    public let title: String
    public let dueDate: Date?
    public let isEnabled: Bool
    public let isCompleted: Bool

    public init(
        id: UUID,
        title: String,
        dueDate: Date?,
        isEnabled: Bool,
        isCompleted: Bool
    ) {
        self.id = id
        self.title = title
        self.dueDate = dueDate
        self.isEnabled = isEnabled
        self.isCompleted = isCompleted
    }

    func notificationRequest(now: Date = Date()) -> ReminderNotificationRequest? {
        guard isEnabled, !isCompleted, let dueDate, dueDate > now else {
            return nil
        }
        return ReminderNotificationRequest(
            identifier: ReminderService.identifier(for: id),
            title: title,
            dueDate: dueDate
        )
    }
}

public protocol ReminderNotificationScheduling: Sendable {
    func authorizationStatus() async -> ReminderAuthorizationStatus
    func requestAuthorization() async throws -> ReminderAuthorizationStatus
    func schedule(_ request: ReminderNotificationRequest) async throws
    func pendingRequestIdentifiers() async -> Set<String>
    func removePendingRequests(withIdentifiers identifiers: [String]) async
}

public final class UserNotificationScheduler: ReminderNotificationScheduling, @unchecked Sendable {
    private let center: UNUserNotificationCenter

    public init(center: UNUserNotificationCenter = .current()) {
        self.center = center
    }

    public func authorizationStatus() async -> ReminderAuthorizationStatus {
        let settings = await center.notificationSettings()
        return ReminderAuthorizationStatus(settings.authorizationStatus)
    }

    public func requestAuthorization() async throws -> ReminderAuthorizationStatus {
        _ = try await center.requestAuthorization(options: [.alert, .sound])
        return await authorizationStatus()
    }

    public func schedule(_ request: ReminderNotificationRequest) async throws {
        let content = UNMutableNotificationContent()
        content.title = request.title
        content.body = "Due now"
        content.sound = .default

        let components = Calendar.current.dateComponents(
            [.calendar, .timeZone, .year, .month, .day, .hour, .minute, .second],
            from: request.dueDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        try await center.add(
            UNNotificationRequest(
                identifier: request.identifier,
                content: content,
                trigger: trigger
            )
        )
    }

    public func pendingRequestIdentifiers() async -> Set<String> {
        let requests = await center.pendingNotificationRequests()
        return Set(requests.map(\.identifier))
    }

    public func removePendingRequests(withIdentifiers identifiers: [String]) async {
        center.removePendingNotificationRequests(withIdentifiers: identifiers)
    }
}

@MainActor
@Observable
public final class ReminderService {
    public private(set) var authorizationStatus: ReminderAuthorizationStatus = .notDetermined
    public private(set) var lastErrorMessage: String?

    @ObservationIgnored
    private let scheduler: any ReminderNotificationScheduling

    public init(scheduler: any ReminderNotificationScheduling) {
        self.scheduler = scheduler
    }

    public nonisolated static func identifier(for taskID: UUID) -> String {
        reminderIdentifierPrefix + taskID.uuidString
    }

    public func refreshAuthorizationStatus() async {
        authorizationStatus = await scheduler.authorizationStatus()
    }

    public func synchronize(
        _ reminder: ReminderSnapshot,
        requestAuthorizationIfNeeded: Bool
    ) async {
        lastErrorMessage = nil
        let identifier = Self.identifier(for: reminder.id)

        guard let request = reminder.notificationRequest() else {
            await scheduler.removePendingRequests(withIdentifiers: [identifier])
            await refreshAuthorizationStatus()
            return
        }

        var status = await scheduler.authorizationStatus()
        if status == .notDetermined, requestAuthorizationIfNeeded {
            do {
                status = try await scheduler.requestAuthorization()
            } catch {
                lastErrorMessage = "OpenFocus could not request notification permission."
                authorizationStatus = await scheduler.authorizationStatus()
                await scheduler.removePendingRequests(withIdentifiers: [identifier])
                return
            }
        }
        authorizationStatus = status

        guard status.allowsScheduling else {
            await scheduler.removePendingRequests(withIdentifiers: [identifier])
            return
        }

        do {
            try await scheduler.schedule(request)
        } catch {
            lastErrorMessage = "OpenFocus could not schedule this reminder."
        }
    }

    public func remove(taskID: UUID) async {
        await scheduler.removePendingRequests(withIdentifiers: [Self.identifier(for: taskID)])
    }

    public func reconcile(_ reminders: [ReminderSnapshot], now: Date = Date()) async {
        lastErrorMessage = nil
        let status = await scheduler.authorizationStatus()
        authorizationStatus = status

        let pending = await scheduler.pendingRequestIdentifiers()
        let managed = pending.filter { $0.hasPrefix(reminderIdentifierPrefix) }
        var desired: [String: ReminderNotificationRequest] = [:]
        for reminder in reminders {
            if let request = reminder.notificationRequest(now: now) {
                desired[request.identifier] = request
            }
        }

        let identifiersToRemove: [String]
        if status.allowsScheduling {
            identifiersToRemove = managed.filter { desired[$0] == nil }.sorted()
        } else {
            identifiersToRemove = managed.sorted()
        }
        if !identifiersToRemove.isEmpty {
            await scheduler.removePendingRequests(withIdentifiers: identifiersToRemove)
        }

        guard status.allowsScheduling else {
            return
        }

        // Schedule each request independently: one scheduler failure (e.g. the OS
        // pending-notification cap) must not skip the rest of the sorted list.
        var encounteredFailure = false
        for request in desired.values.sorted(by: { $0.identifier < $1.identifier }) {
            do {
                try await scheduler.schedule(request)
            } catch {
                encounteredFailure = true
            }
        }
        if encounteredFailure {
            lastErrorMessage = "OpenFocus could not reconcile all pending reminders."
        }
    }
}

private extension ReminderAuthorizationStatus {
    init(_ status: UNAuthorizationStatus) {
        switch status {
        case .notDetermined:
            self = .notDetermined
        case .denied:
            self = .denied
        case .authorized:
            self = .authorized
        case .provisional:
            self = .provisional
        case .ephemeral:
            self = .ephemeral
        @unknown default:
            self = .denied
        }
    }
}
