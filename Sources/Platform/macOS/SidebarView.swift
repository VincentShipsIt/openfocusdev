import Combine
import SwiftUI
import SwiftData
import OpenFocusData

/// The macOS sidebar. Native `List(.sidebar)` selection renders the glass
/// selection material itself — there is intentionally NO custom selection pill.
struct SidebarView: View {
    @Binding var selection: SidebarSelection?
    @Query private var projects: [Project]
    @State private var showingNewProject = false
    /// Drives Today's numbered icon; a Mac window can stay open across midnight.
    @State private var today = Date()

    private var sortedProjects: [Project] { projects.sorted { $0.order < $1.order } }

    var body: some View {
        List(selection: $selection) {
            Section {
                ForEach(SmartList.allCases) { item in
                    Label(item.title, systemImage: item.symbol(on: today))
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
        .navigationTitle("OpenFocus")
        .toolbar {
            ToolbarItem {
                Button { showingNewProject = true } label: {
                    Label("New Project", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showingNewProject) { NewProjectSheet() }
        .onReceive(NotificationCenter.default.publisher(for: .NSCalendarDayChanged)) { _ in
            today = Date()
        }
    }
}
