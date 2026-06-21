import Foundation
import TodoCore
import TodoCLIKit
import TodoData

/// `todo` — a scriptable shell over the same engine the app uses. The file is
/// deliberately not named `main.swift` so `@main` can drive an async entry point.
@main
struct TodoCLIMain {
    static func main() async {
        let command = TodoCommand.parse(CommandLine.arguments)

        await MainActor.run {
            switch command {
            case .help:
                print(TodoCommand.usage)

            case .add(let text):
                let services = TodoServices.live()
                let task = services.aiService.quickAdd(text)
                let due = task.dueDate.map { " (due \($0.formatted(date: .abbreviated, time: .shortened)))" } ?? ""
                print("Added: \(task.title)\(due)")

            case .list:
                let services = TodoServices.live()
                let tasks = services.taskService.today()
                if tasks.isEmpty {
                    print("Nothing due today.")
                } else {
                    for task in tasks {
                        print("• \(task.title)")
                    }
                }
            }
        }
    }
}
