import Foundation

extension Notification.Name {
    /// Posted by the macOS "New Task" command (⌘N) to focus the quick-add field.
    static let newTask = Notification.Name("dev.openfocus.newTask")
}
