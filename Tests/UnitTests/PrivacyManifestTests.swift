import Foundation
import Testing

@Suite struct PrivacyManifestTests {
    @Test func declaresAuditedPrivacyPractices() throws {
        let manifest = try propertyList(at: "Resources/PrivacyInfo.xcprivacy")
        let expectedKeys = Set([
            "NSPrivacyAccessedAPITypes",
            "NSPrivacyCollectedDataTypes",
            "NSPrivacyTracking",
            "NSPrivacyTrackingDomains",
        ])

        #expect(Set(manifest.keys) == expectedKeys)
        #expect(manifest["NSPrivacyTracking"] as? Bool == false)
        #expect(manifest["NSPrivacyTrackingDomains"] as? [String] == [])
        let accessedAPITypes = try #require(
            manifest["NSPrivacyAccessedAPITypes"] as? [[String: Any]]
        )
        #expect(accessedAPITypes.isEmpty)

        let collectedDataTypes = try #require(
            manifest["NSPrivacyCollectedDataTypes"] as? [[String: Any]]
        )
        let userContent = try #require(collectedDataTypes.count == 1 ? collectedDataTypes[0] : nil)

        #expect(
            userContent["NSPrivacyCollectedDataType"] as? String
                == "NSPrivacyCollectedDataTypeOtherUserContent"
        )
        #expect(userContent["NSPrivacyCollectedDataTypeLinked"] as? Bool == true)
        #expect(userContent["NSPrivacyCollectedDataTypeTracking"] as? Bool == false)
        #expect(
            userContent["NSPrivacyCollectedDataTypePurposes"] as? [String]
                == ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
        )
    }

    @Test(arguments: ["OpenFocus-macOS", "OpenFocus-iOS"])
    func appTargetIncludesSharedResources(target: String) throws {
        let project = try text(at: "project.yml")
        let lines = project.split(separator: "\n", omittingEmptySubsequences: false)
        let targetLine = "  \(target):"
        let start = try #require(lines.firstIndex { $0 == targetLine })
        let remainingLines = lines.index(after: start)..<lines.endIndex
        let end = remainingLines.first { index in
            let line = lines[index]
            return line.hasPrefix("  ") && !line.hasPrefix("    ") && line.hasSuffix(":")
        } ?? lines.endIndex
        let targetBlock = lines[start..<end].joined(separator: "\n")

        #expect(targetBlock.contains("      - path: Resources"))
    }

    private func propertyList(at relativePath: String) throws -> [String: Any] {
        let data = try Data(contentsOf: repositoryRoot.appendingPathComponent(relativePath))
        let propertyList = try PropertyListSerialization.propertyList(from: data, format: nil)
        return try #require(propertyList as? [String: Any])
    }

    private func text(at relativePath: String) throws -> String {
        try String(contentsOf: repositoryRoot.appendingPathComponent(relativePath), encoding: .utf8)
    }

    private var repositoryRoot: URL {
        URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
    }
}
