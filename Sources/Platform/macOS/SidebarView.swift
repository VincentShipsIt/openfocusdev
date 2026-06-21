import SwiftUI
import SwiftData
import TodoData

/// The macOS sidebar. Native `List(.sidebar)` selection renders the glass
/// selection material itself — there is intentionally NO custom selection pill.
struct SidebarView: View {
    @Binding var selection: SidebarSelection?
    @Query private var projects: [Project]
    @State private var showingNewProject = false

    private var sortedProjects: [Project] { projects.sorted { $0.order < $1.order } }

    var body: some View {
        List(selection: $selection) {
            Section {
                ForEach(SmartList.allCases) { item in
                    Label(item.title, systemImage: item.symbol)
                        .tag(SidebarSelection.smart(item))
                }
            }

            Section("Projects") {
                ForEach(sortedProjects) { project in
                    Label(project.name, systemImage: project.symbol)
                        .foregroundStyle(Color(hex: project.colorHex))
                        .tag(SidebarSelection.project(project.id))
                }
            }
        }
        .navigationTitle("OpenTodo")
        .toolbar {
            ToolbarItem {
                Button { showingNewProject = true } label: {
                    Label("New Project", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showingNewProject) { NewProjectSheet() }
    }
}
