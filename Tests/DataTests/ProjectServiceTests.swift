import Foundation
import Testing
import SwiftData
@testable import OpenFocusCore
@testable import OpenFocusData

@MainActor
@Suite
struct ProjectServiceTests {
    /// Holds the container alongside the service: `mainContext` doesn't keep its
    /// container alive, so returning the service on its own lets the store
    /// deallocate mid-test and crashes the runner.
    private struct Harness {
        let container: ModelContainer
        let projects: ProjectService
    }

    private func makeHarness() throws -> Harness {
        let container = try OpenFocusModelContainer.make(inMemory: true)
        return Harness(container: container, projects: ProjectService(context: container.mainContext))
    }

    @Test func createAssignsSequentialOrder() throws {
        let harness = try makeHarness()
        let service = harness.projects
        let first = service.create(name: "Work")
        let second = service.create(name: "Home")

        #expect(first.order == 0)
        #expect(second.order == 1)
        #expect(service.all().map(\.name) == ["Work", "Home"])
    }

    @Test func findOrCreateReturnsAnExistingProject() throws {
        let harness = try makeHarness()
        let service = harness.projects
        let existing = service.create(name: "Work")

        #expect(service.findOrCreate(named: "Work") === existing)
        #expect(service.all().count == 1)
    }

    /// "#Work" and "#work" are the same project — otherwise quick-add would spawn a
    /// near-duplicate on every capitalization slip.
    @Test(arguments: ["work", "WORK", "  Work  "])
    func findOrCreateMatchesCaseAndWhitespaceInsensitively(input: String) throws {
        let harness = try makeHarness()
        let service = harness.projects
        let existing = service.create(name: "Work")

        #expect(service.findOrCreate(named: input) === existing)
        #expect(service.all().count == 1)
    }

    @Test func findOrCreateCreatesOnAMiss() throws {
        let harness = try makeHarness()
        let service = harness.projects
        service.create(name: "Work")

        let created = service.findOrCreate(named: "Reading")

        #expect(created?.name == "Reading")
        #expect(created?.order == 1)
        #expect(service.all().count == 2)
    }

    /// A bare `#` parses to an empty name; creating a nameless project would leave
    /// an unlabelled row in Browse with no way to fix it.
    @Test(arguments: ["", "   "])
    func findOrCreateRejectsABlankName(input: String) throws {
        let harness = try makeHarness()
        let service = harness.projects

        #expect(service.findOrCreate(named: input) == nil)
        #expect(service.all().isEmpty)
    }

    /// Typing `#work` where an archived "Work" exists brings it back rather than
    /// creating a second project with the same name — a duplicate name would make
    /// every later `#work` ambiguous, and filing into a hidden project would make
    /// the task look lost.
    @Test func findOrCreateRestoresAnArchivedMatch() throws {
        let harness = try makeHarness()
        let service = harness.projects
        let archived = service.create(name: "Work")
        service.archive(archived)

        let resolved = service.findOrCreate(named: "work")

        #expect(resolved === archived)
        #expect(archived.isArchived == false)
        #expect(service.all().count == 1)
    }

    /// With both an archived and a live project of the same name, the live one wins
    /// and the archived one stays archived.
    @Test func findOrCreatePrefersALiveMatchOverAnArchivedOne() throws {
        let harness = try makeHarness()
        let service = harness.projects
        let archived = service.create(name: "Work")
        service.archive(archived)
        let live = service.create(name: "Work")

        #expect(service.findOrCreate(named: "Work") === live)
        #expect(archived.isArchived)
    }

    @Test func deleteRemovesTheProject() throws {
        let harness = try makeHarness()
        let service = harness.projects
        let project = service.create(name: "Work")

        service.delete(project)

        #expect(service.all().isEmpty)
    }
}
