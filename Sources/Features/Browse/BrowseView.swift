import SwiftUI
import SwiftData
import OpenFocusData

/// iOS "Browse" tab — Todoist's fourth tab. Everything that isn't a bottom-bar
/// list lives here: search, the project list, and Completed.
struct BrowseView: View {
    @Query private var projects: [Project]
    @State private var showingNewProject = false
    @State private var searchText = ""

    private var sortedProjects: [Project] { projects.sorted { $0.order < $1.order } }

    private var query: String { searchText.trimmingCharacters(in: .whitespaces) }

    private var filteredProjects: [Project] {
        guard !query.isEmpty else { return sortedProjects }
        return sortedProjects.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        List {
            Section("Projects") {
                ForEach(filteredProjects) { project in
                    NavigationLink(value: SidebarSelection.project(project.id)) {
                        Label(project.name, systemImage: project.symbol)
                            .foregroundStyle(Color(hex: project.colorHex))
                    }
                }

                if query.isEmpty {
                    addProjectRow
                } else if filteredProjects.isEmpty {
                    Text("No matching projects.")
                        .foregroundStyle(.secondary)
                }
            }

            Section {
                row(for: .completed)
            }
        }
        .navigationTitle("Browse")
        .searchable(text: $searchText, prompt: "Search projects")
        .navigationDestination(for: SidebarSelection.self) { selection in
            TaskListContainer(selection: selection)
        }
        .sheet(isPresented: $showingNewProject) { NewProjectSheet() }
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

    private func row(for list: SmartList) -> some View {
        NavigationLink(value: SidebarSelection.smart(list)) {
            Label(list.title, systemImage: list.symbol())
        }
    }
}
