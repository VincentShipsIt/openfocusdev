import SwiftUI

/// macOS menu commands. ⌘N focuses the quick-add field via a notification.
struct TodoCommands: Commands {
    var body: some Commands {
        CommandGroup(replacing: .newItem) {
            Button("New Task") {
                NotificationCenter.default.post(name: .newTask, object: nil)
            }
            .keyboardShortcut("n", modifiers: .command)
        }
    }
}
