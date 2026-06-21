import SwiftUI
import SwiftData
import TodoData

/// iOS "Projects" tab: a list of projects that pushes into the project's tasks.
struct ProjectsListView: View {
    @Query private var projects: [Project]
    @State private var showingNew = false

    private var sortedProjects: [Project] { projects.sorted { $0.order < $1.order } }

    var body: some View {
        List {
            ForEach(sortedProjects) { project in
                NavigationLink(value: project.id) {
                    Label(project.name, systemImage: project.symbol)
                        .foregroundStyle(Color(hex: project.colorHex))
                }
            }
        }
        .navigationTitle("Projects")
        .navigationDestination(for: UUID.self) { id in
            TaskListContainer(selection: .project(id))
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showingNew = true } label: {
                    Label("New Project", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showingNew) { NewProjectSheet() }
        .overlay {
            if projects.isEmpty {
                ContentUnavailableView(
                    "No projects",
                    systemImage: "folder",
                    description: Text("Tap + to create one.")
                )
            }
        }
    }
}
