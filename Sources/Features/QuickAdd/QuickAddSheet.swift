import SwiftUI
import OpenFocusCore
import OpenFocusData

/// The compose surface the quick-add chip presents. On-device parsing turns
/// "report fri 5pm !1 #work @review" into a dated, prioritized, labeled task on
/// submit. The field autofocuses so the keyboard is up the moment the sheet
/// appears.
///
/// The sheet parses its own text rather than being handed the result: the project
/// picker, the reminder toggle and the preview row all key off the same draft, and
/// re-parsing a short string on each keystroke is cheaper than threading three
/// derived values through the caller.
struct QuickAddSheet: View {
    @Binding var text: String
    @Binding var reminderEnabled: Bool
    /// The picked project. A typed `#project` outranks it — same precedence as
    /// `TaskService.create` — so the label below shows whichever will win.
    @Binding var projectID: UUID?
    let projects: [Project]
    let onSubmit: () -> Void

    @FocusState private var focused: Bool
    @Environment(\.dismiss) private var dismiss

    private var draft: TaskDraft {
        NaturalLanguageTaskParser().parse(text)
    }

    private var isEmpty: Bool {
        text.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private var selectedProject: Project? {
        projects.first { $0.id == projectID }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                TextField("Add a task…", text: $text, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.title3)
                    .focused($focused)
                    .onSubmit(submit)
                    .padding()

                Divider()

                HStack(spacing: AppTheme.Spacing.sm) {
                    projectMenu
                    metadata
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.vertical, AppTheme.Spacing.sm)

                // A reminder needs a due date, so the toggle only appears once the
                // typed text resolves to a dated task.
                if draft.dueDate != nil {
                    Divider()
                    Toggle(isOn: $reminderEnabled) {
                        Label("Remind me", systemImage: "bell")
                    }
                    .padding()
                }
            }
            .frame(maxHeight: .infinity, alignment: .top)
            .navigationTitle("New task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add", action: submit).disabled(isEmpty)
                }
            }
        }
        .presentationDetents([.height(260), .medium])
        .onAppear { focused = true }
    }

    // MARK: - Project

    /// Names the project the task will actually land in, which is why a typed
    /// `#token` is shown even when it doesn't match an existing project: it will
    /// create one on save, and hiding that would be a surprise.
    private var projectMenu: some View {
        Menu {
            Button { choose(nil) } label: {
                menuLabel("Inbox", isSelected: resolvedProjectName == nil)
            }
            ForEach(projects) { project in
                Button { choose(project) } label: {
                    menuLabel(
                        project.name,
                        isSelected: resolvedProjectName?.localizedCaseInsensitiveCompare(
                            project.name
                        ) == .orderedSame
                    )
                }
            }
        } label: {
            Label(resolvedProjectName ?? "Inbox", systemImage: "number")
                .font(.subheadline)
        }
        .menuStyle(.button)
        .buttonStyle(.bordered)
    }

    private var resolvedProjectName: String? {
        draft.projectName ?? selectedProject?.name
    }

    @ViewBuilder
    private func menuLabel(_ title: String, isSelected: Bool) -> some View {
        // A manual checkmark rather than a `Picker`: the selection can come from
        // typed text as well as this menu, which a picker's single binding can't
        // represent.
        if isSelected {
            Label(title, systemImage: "checkmark")
        } else {
            Text(title)
        }
    }

    /// Picking from the menu also strips any typed `#token`. The token would win at
    /// save time, so the alternative is a picker that silently lies.
    private func choose(_ project: Project?) {
        projectID = project?.id
        if draft.projectName != nil {
            text = NaturalLanguageTaskParser.strippingProjectTokens(from: text)
        }
    }

    // MARK: - Preview

    /// What the parser understood, so `!1` and `fri 5pm` visibly do something before
    /// the task is saved rather than after.
    @ViewBuilder
    private var metadata: some View {
        if let dueDate = dueDateText {
            chip(dueDate, "calendar")
        }
        if draft.priority != .medium {
            chip(draft.priority.label, "flag.fill")
                .foregroundStyle(draft.priority.color)
        }
        ForEach(draft.labels, id: \.self) { label in
            chip(label, "tag")
        }
    }

    /// A bare day ("fri") parses to midnight; printing "12 AM" would invent a time
    /// the user never typed, so the clock is only shown when one was parsed.
    private var dueDateText: String? {
        guard let dueDate = draft.dueDate else { return nil }
        let calendar = Calendar.current
        let hasTime = calendar.component(.hour, from: dueDate) != 0
            || calendar.component(.minute, from: dueDate) != 0
        return hasTime
            ? dueDate.formatted(.dateTime.weekday(.abbreviated).hour().minute())
            : dueDate.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
    }

    private func chip(_ title: String, _ symbol: String) -> some View {
        Label(title, systemImage: symbol)
            .font(.caption)
            .foregroundStyle(.secondary)
    }

    private func submit() {
        guard !isEmpty else { return }
        onSubmit()
        dismiss()
    }
}
