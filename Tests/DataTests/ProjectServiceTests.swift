import Foundation
import Testing
import SwiftData
@testable import OpenFocusCore
@testable import OpenFocusData

@MainActor
@Suite
struct ProjectServiceTests {
    private func makeService() throws -> ProjectService {
        let container = try OpenFocusModelContainer.make(inMemory: true)
        return ProjectService(context: container.mainContext)
    }

    @Test func createAssignsSequentialOrder() throws {
        let service = try makeService()
        let first = service.create(name: "Work")
        let second = service.create(name: "Home")

        #expect(first.order == 0)
        #expect(second.order == 1)
        #expect(service.all().map(\.name) == ["Work", "Home"])
    }

    @Test func findOrCreateReturnsAnExistingProject() throws {
        let service = try makeService()
        let existing = service.create(name: "Work")

        #expect(service.findOrCreate(named: "Work") === existing)
        #expect(service.all().count == 1)
    }

    /// "#Work" and "#work" are the same project — otherwise quick-add would spawn a
    /// near-duplicate on every capitalization slip.
    @Test(arguments: ["work", "WORK", "  Work  "])
    func findOrCreateMatchesCaseAndWhitespaceInsensitively(input: String) throws {
        let service = try makeService()
        let existing = service.create(name: "Work")

        #expect(service.findOrCreate(named: input) === existing)
        #expect(service.all().count == 1)
    }

    @Test func findOrCreateCreatesOnAMiss() throws {
        let service = try makeService()
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
        let service = try makeService()

        #expect(service.findOrCreate(named: input) == nil)
        #expect(service.all().isEmpty)
    }

    @Test func deleteRemovesTheProject() throws {
        let service = try makeService()
        let project = service.create(name: "Work")

        service.delete(project)

        #expect(service.all().isEmpty)
    }
}
