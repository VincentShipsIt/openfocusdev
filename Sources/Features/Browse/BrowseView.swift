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
                if filteredProjects.isEmpty {
                    Text(query.isEmpty ? "No projects yet — tap + to create one." : "No matching projects.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(filteredProjects) { project in
                        NavigationLink(value: SidebarSelection.project(project.id)) {
                            Label(project.name, systemImage: project.symbol)
                                .foregroundStyle(Color(hex: project.colorHex))
                        }
                    }
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
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showingNewProject = true } label: {
                    Label("New Project", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showingNewProject) { NewProjectSheet() }
    }

    private func row(for list: SmartList) -> some View {
        NavigationLink(value: SidebarSelection.smart(list)) {
            Label(list.title, systemImage: list.symbol())
        }
    }
}
