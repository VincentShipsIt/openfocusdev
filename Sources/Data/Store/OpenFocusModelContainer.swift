import Foundation
import SwiftData

/// Builds the app's SwiftData store. Ships **local-only** so the app runs with no
/// Apple Developer team. To enable Mac↔iPhone iCloud sync: add the iCloud
/// entitlement + container to the app targets and switch `cloudKitDatabase` from
/// `.none` to `.automatic` (see ARCHITECTURE.md). The model graph is already
/// CloudKit-compatible, so that single flip is enough.
public enum OpenFocusModelContainer {
    public static let schema = Schema([TodoTask.self, Project.self])

    public static func live(inMemory: Bool = false) -> ModelContainer {
        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: inMemory,
            cloudKitDatabase: .none // ← flip to `.automatic` once iCloud is provisioned
        )
        do {
            return try ModelContainer(for: schema, configurations: configuration)
        } catch {
            // Last-resort in-memory fallback so a corrupt store never bricks launch.
            let fallback = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
            // swiftlint:disable:next force_try
            return try! ModelContainer(for: schema, configurations: fallback)
        }
    }
}
