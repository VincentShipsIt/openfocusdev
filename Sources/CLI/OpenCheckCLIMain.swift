import Foundation
import OpenCheckCore
import OpenCheckCLIKit
import OpenCheckData

/// `opencheck` — a scriptable shell over the same engine the app uses. The file is
/// deliberately not named `main.swift` so `@main` can drive an async entry point.
@main
struct OpenCheckCLIMain {
    static func main() async {
        let command = OpenCheckCommand.parse(CommandLine.arguments)

        await MainActor.run {
            switch command {
            case .help:
                print(OpenCheckCommand.usage)

            case .add(let text):
                let services = OpenCheckServices.live()
                let task = services.aiService.quickAdd(text)
                let due = task.dueDate.map { " (due \($0.formatted(date: .abbreviated, time: .shortened)))" } ?? ""
                print("Added: \(task.title)\(due)")

            case .list:
                let services = OpenCheckServices.live()
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
