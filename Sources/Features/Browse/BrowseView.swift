import SwiftUI
import SwiftData
import OpenFocusData

/// iOS "Browse" tab — Todoist's fourth tab. Everything that isn't a bottom-bar
/// list lives here: search, the project list, Completed, and the way into Settings
/// (iOS has no Settings scene, so the gear has to live in the app's own chrome).
struct BrowseView: View {
    @Query private var projects: [Project]
    @State private var showingNewProject = false
    @State private var showingSettings = false
    @State private var searchText = ""

    private var sortedProjects: [Project] { projects.sorted { $0.order < $1.order } }

    private var query: String { searchText.trimmingCharacters(in: .whitespaces) }

    private var filteredProjects: [Project] {
        guard !query.isEmpty else { return sortedProjects }
        return sortedProjects.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        List {
            // Utility rows lead, projects follow — the grouping order Todoist uses,
            // so the list you scroll is the one you came here for.
            Section {
                row(for: .completed)
            }

            Section("My Projects") {
                ForEach(filteredProjects) { project in
                    NavigationLink(value: SidebarSelection.project(project.id)) {
                        projectLabel(for: project)
                    }
                    // Trailing open-task count, like Todoist's project list. Zero
                    // renders nothing, so a cleared project reads as clear.
                    .badge(project.activeTaskCount)
                }

                if query.isEmpty {
                    addProjectRow
                } else if filteredProjects.isEmpty {
                    Text("No matching projects.")
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle("Browse")
        .searchable(text: $searchText, prompt: "Search projects")
        .toolbar { toolbarContent }
        .navigationDestination(for: SidebarSelection.self) { selection in
            TaskListContainer(selection: selection)
        }
        .sheet(isPresented: $showingNewProject) { NewProjectSheet() }
        .sheet(isPresented: $showingSettings) { SettingsScreen() }
    }

    /// `.primaryAction` rather than `.topBarTrailing`: this view is compiled into
    /// the macOS target too, where the iOS-only placement doesn't exist.
    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .primaryAction) {
            Button { showingSettings = true } label: {
                Label("Settings", systemImage: "gearshape")
            }
        }
    }

    /// Todoist's "+ Add project" — inline at the foot of the list rather than a
    /// toolbar button, so creating a project reads as part of the project list.
    /// Always present when not searching, which also replaces the empty state.
    private var addProjectRow: some View {
        Button { showingNewProject = true } label: {
            Label("Add project", systemImage: "plus")
                .foregroundStyle(Color.accentColor)
        }
    }

    /// The project's colour tints the glyph only. Tinting the whole `Label` dyed the
    /// project name too, which read as washed-out body text; Todoist keeps the name
    /// at full contrast and lets the dot carry the colour.
    private func projectLabel(for project: Project) -> some View {
        Label {
            Text(project.name)
        } icon: {
            Image(systemName: project.symbol)
                .foregroundStyle(Color(hex: project.colorHex))
        }
    }

    private func row(for list: SmartList) -> some View {
        NavigationLink(value: SidebarSelection.smart(list)) {
            Label(list.title, systemImage: list.symbol())
        }
    }
}
