import SwiftUI
import UIKit
import OpenFocusData

/// iOS notification status and recovery actions. Reminder scheduling stays in
/// `OpenFocusData`; this surface only explains the current system authorization.
struct SettingsView: View {
    @Environment(ReminderService.self) private var reminderService
    @Environment(\.openURL) private var openURL

    var body: some View {
        Form {
            Section("Notifications") {
                LabeledContent("Permission", value: statusTitle)

                Text(statusDescription)
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                if reminderService.authorizationStatus == .denied {
                    Button("Open System Settings", systemImage: "gear") {
                        guard let url = URL(string: UIApplication.openSettingsURLString) else {
                            return
                        }
                        openURL(url)
                    }
                }

                if let errorMessage = reminderService.lastErrorMessage {
                    Label(errorMessage, systemImage: "exclamationmark.triangle")
                        .font(.footnote)
                        .foregroundStyle(.red)
                }
            }
        }
        .navigationTitle("Settings")
        .task {
            await reminderService.refreshAuthorizationStatus()
        }
    }

    private var statusTitle: String {
        switch reminderService.authorizationStatus {
        case .notDetermined:
            "Not requested"
        case .denied:
            "Denied"
        case .authorized:
            "Allowed"
        case .provisional:
            "Delivered quietly"
        case .ephemeral:
            "Temporarily allowed"
        }
    }

    private var statusDescription: String {
        switch reminderService.authorizationStatus {
        case .notDetermined:
            "OpenFocus asks only when you enable a due-date reminder."
        case .denied:
            "Reminders stay off. Task creation and editing continue to work normally."
        case .authorized:
            "Enabled due-date reminders can alert you at their scheduled time."
        case .provisional:
            "Reminders are delivered quietly until you choose how notifications should appear."
        case .ephemeral:
            "Notifications are temporarily available for this app session."
        }
    }
}
