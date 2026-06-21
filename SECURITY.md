# Security

## Data & privacy

- All task data is stored **on device** via SwiftData. When iCloud sync is
  enabled it lives in the user's **private** CloudKit database — there is no
  OpenTodo server and no third party in the loop.
- The AI API key is stored in the **Keychain** (`KeychainService`), never in
  plaintext, `UserDefaults`, or the repo.
- Only task text the user explicitly sends to the planning agent leaves the
  device, and only to the configured AI endpoint.

## Reporting

This is a pre-alpha, single-maintainer project. Report vulnerabilities privately
via a GitHub security advisory on the repository rather than a public issue.
