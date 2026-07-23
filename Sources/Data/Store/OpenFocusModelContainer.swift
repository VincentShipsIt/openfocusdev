import Foundation
import SwiftData

/// Builds the app's SwiftData store. Ships **local-only** so the app runs with no
/// Apple Developer team. To enable Mac↔iPhone iCloud sync: add the iCloud
/// entitlement + container to the app targets and switch `cloudKitDatabase` from
/// `.none` to `.automatic` (see ARCHITECTURE.md). The model graph is already
/// CloudKit-compatible, so that single flip is enough.
public enum OpenFocusModelContainer {
    public static let schema = Schema([TodoTask.self, Project.self])

    /// Builds a container without recovery. Tests use this entry point so a
    /// persistence setup failure is reported instead of silently falling back.
    public static func make(inMemory: Bool = false) throws -> ModelContainer {
        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: inMemory,
            cloudKitDatabase: .none // ← flip to `.automatic` once iCloud is provisioned
        )

        return try ModelContainer(for: schema, configurations: configuration)
    }

    /// Builds the live store, retaining the in-memory recovery path that keeps a
    /// corrupt on-disk store from preventing the app from launching.
    public static func live(inMemory: Bool = false) -> ModelContainer {
        do {
            return try make(inMemory: inMemory)
        } catch {
            // Keep recovery local-only even after the live store enables CloudKit.
            let fallback = ModelConfiguration(
                schema: schema,
                isStoredInMemoryOnly: true,
                cloudKitDatabase: .none
            )
            // swiftlint:disable:next force_try
            return try! ModelContainer(for: schema, configurations: fallback)
        }
    }
}
