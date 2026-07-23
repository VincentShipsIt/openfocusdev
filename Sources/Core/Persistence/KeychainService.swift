import Foundation
import KeychainAccess

/// Thin wrapper over the system Keychain for the few secrets OpenCheck holds
/// (today: the AI API key). The underlying Keychain is thread-safe, so this is
/// safe to read from the AI client's request closure off the main actor.
public struct KeychainService: @unchecked Sendable {
    private let keychain: Keychain
    private static let aiKeyName = "ai_api_key"

    public init(service: String = "dev.opencheck.app") {
        self.keychain = Keychain(service: service)
    }

    public var aiAPIKey: String? {
        try? keychain.get(Self.aiKeyName)
    }

    public func setAIAPIKey(_ value: String?) {
        if let value, !value.isEmpty {
            try? keychain.set(value, key: Self.aiKeyName)
        } else {
            try? keychain.remove(Self.aiKeyName)
        }
    }
}
