import Foundation

/// System/user prompt builders for the AI features. Pure string shaping, kept in
/// Core so the app and CLI use identical prompts.
public enum AIPrompts {
    public static let planner = """
    You are a focused daily planning assistant inside a to-do app. Given the user's \
    tasks for today, produce a short, ordered plan: group by priority and energy, \
    suggest a sensible sequence, propose rough time blocks, and call out the single \
    most important task to do first. Be concise and practical, using plain text with \
    short lines. Do not invent tasks that were not provided.
    """

    public static func planUserMessage(tasks: [String], dateLabel: String) -> String {
        let list = tasks.isEmpty ? "(no tasks for today)" : tasks.map { "- \($0)" }.joined(separator: "\n")
        return "Date: \(dateLabel)\nToday's tasks:\n\(list)"
    }
}
