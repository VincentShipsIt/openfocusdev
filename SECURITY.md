# Security

## Data & privacy

OpenFocus has no developer-operated server and does not track users. The shared
[`Resources/PrivacyInfo.xcprivacy`](Resources/PrivacyInfo.xcprivacy) file is
bundled by both app targets through the existing `Resources` entries in
`project.yml`.

| Data or capability | Storage or destination | Privacy declaration |
| --- | --- | --- |
| Tasks and projects | SwiftData on device | Not collected; data stays on device |
| iCloud sync | Disabled in the current configuration; when enabled, the user's private CloudKit database | Apple service data, not available to the OpenFocus developer |
| AI API key | Keychain on device; sent only as authorization to the endpoint the user configures | Never stored in plaintext, `UserDefaults`, or the repository |
| AI task text | Sent only after an explicit planning action to the configured AI endpoint | Other User Content, linked, App Functionality, not tracking |
| Notifications | Local system scheduling when implemented | No task content is sent to APNs or a developer server |

The source audit for the current manifest found no direct app use of Apple's
required-reason API categories, so `NSPrivacyAccessedAPITypes` is empty.
`NSPrivacyTracking` is false and no tracking domains are declared.

Any change that adds a network destination, analytics, advertising, remote
notifications, a required-reason API, or a new off-device data flow must update
the manifest, this table, and the App Store Connect privacy answers in the same
release.

## Reporting

This is a pre-alpha, single-maintainer project. Report vulnerabilities privately
via a GitHub security advisory on the repository rather than a public issue.
