import Foundation

/// OpenAI-compatible chat client (OpenRouter by default). Stateless and `Sendable`:
/// holds immutable config + a key-provider closure and talks over `URLSession`.
public struct OpenRouterAIClient: AIClient {
    private let config: AIConfig
    private let apiKey: @Sendable () -> String?
    private let session: URLSession

    public init(
        config: AIConfig = AIConfig(),
        session: URLSession = .shared,
        apiKey: @escaping @Sendable () -> String?
    ) {
        self.config = config
        self.session = session
        self.apiKey = apiKey
    }

    public func complete(system: String, user: String) async throws -> String {
        guard let key = apiKey(), !key.isEmpty else { throw AIError.missingAPIKey }

        var request = URLRequest(url: config.baseURL.appendingPathComponent("chat/completions"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
        request.setValue("https://openfocus.dev", forHTTPHeaderField: "HTTP-Referer")
        request.setValue("OpenFocus", forHTTPHeaderField: "X-Title")

        let payload = ChatRequest(
            model: config.model,
            messages: [
                ChatRequest.Message(role: "system", content: system),
                ChatRequest.Message(role: "user", content: user),
            ]
        )
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw AIError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else {
            throw AIError.requestFailed(status: http.statusCode, body: String(data: data, encoding: .utf8) ?? "")
        }

        let decoded = try JSONDecoder().decode(ChatResponse.self, from: data)
        guard let content = decoded.choices.first?.message.content, !content.isEmpty else {
            throw AIError.emptyResponse
        }
        return content.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

// MARK: - Wire types

private struct ChatRequest: Encodable {
    let model: String
    let messages: [Message]

    struct Message: Encodable {
        let role: String
        let content: String
    }
}

private struct ChatResponse: Decodable {
    let choices: [Choice]

    struct Choice: Decodable {
        let message: Message
    }

    struct Message: Decodable {
        let content: String
    }
}
