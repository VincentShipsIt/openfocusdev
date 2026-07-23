# Architecture

OpenCheck is a native Swift app for macOS 26 / iOS 26. One engine, several thin
surfaces. No server, no monorepo — the GitHub repo doubles as the marketing page.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│  App surfaces (thin shells)                                  │
│  Sources/App · Sources/Features · Sources/SharedUI ·         │
│  Sources/Platform/{macOS,iOS}            +   Sources/CLI     │
│        SwiftUI views + view state              `opencheck` tool   │
└───────────────┬─────────────────────────────────┬───────────┘
                │ links                            │ links
        ┌───────▼────────┐                 ┌───────▼────────┐
        │  OpenCheckData      │  SwiftData      │  OpenCheckCLIKit    │
        │  @Model types  │  @Observable    │  arg parsing   │
        │  services      │  services       │                │
        │  ModelContainer│  (CloudKit-ready)│               │
        └───────┬────────┘                 └───────┬────────┘
                │ depends on                       │ depends on
                └────────────────┬─────────────────┘
                         ┌───────▼────────┐
                         │  OpenCheckCore      │  pure, value types,
                         │  models · AI   │  no SwiftData, no UI
                         │  NL parsing    │  (CLT-buildable)
                         └────────────────┘
```

- **OpenCheckCore** — value-type models (`Priority`, `TaskDraft`, `RecurrenceRule`),
  the AI client seam (`AIClient` + `OpenRouterAIClient`), prompts, and the
  natural-language date parser. No SwiftData, no UI, so it unit-tests on a
  Command Line Tools–only host.
- **OpenCheckData** — SwiftData `@Model` types (`TodoTask`, `Project`), the
  `@Observable @MainActor` services (`TaskService`, `ProjectService`,
  `AIService`), and `OpenCheckModelContainer` (the CloudKit-ready store). Requires the
  Xcode toolchain (SwiftData macros).
- **App / CLI** — SwiftUI views and the `opencheck` command line tool are shells over
  the services. The Xcode app targets (in `project.yml`) compile the SwiftUI
  sources directly and link `OpenCheckCore` + `OpenCheckData`.

## Why two build systems

`Package.swift` builds the pure engine + CLI + tests for the fast local TDD loop
(`swift test`, set `TODO_SKIP_SWIFTDATA=1` on a CLT-only host). The **app** is
built from `project.yml` via `xcodegen` because SwiftUI app bundles, entitlements,
and asset catalogs are an Xcode concern, not SwiftPM's. `project.yml` is the
single source of truth — `OpenCheck.xcodeproj` is generated and gitignored.

## Data model

Ported from the original task schema. `TodoTask`: title, notes, dueDate,
completedAt, priority, labels, order, subtasks (self-relation), project,
recurrence (Codable blob), and AI fields (`aiEnabled`, `aiPrompt`,
`aiExecutionStatus`, `aiExecutionResult`). `Project`: name, color, symbol,
order, favorite, tasks. All properties carry defaults / are optional and there
are **no unique constraints** — both requirements for CloudKit mirroring.

## Sync (Mac ↔ iPhone)

`OpenCheckModelContainer` builds a `ModelConfiguration`. It ships **local-only** so the
app builds and runs with no Apple Developer team. To turn on iCloud sync:

1. In `project.yml`, add a `CODE_SIGN_ENTITLEMENTS` file to both app targets with
   `com.apple.developer.icloud-services = [CloudKit]` and an
   `iCloud.dev.opencheck` container; set your `DEVELOPMENT_TEAM`.
2. In `OpenCheckModelContainer`, switch `cloudKitDatabase:` from `.none` to
   `.automatic`. SwiftData then mirrors the private database with an offline
   queue and automatic conflict merge — no backend to run.

For richer control (background change notifications, custom merge) the same model
graph can move to `CKSyncEngine`; see `apple/sample-cloudkit-sync-engine`.

## AI

`AIClient` is the seam. `OpenRouterAIClient` calls an OpenAI-compatible chat API
over `URLSession`; the key lives in the Keychain (`KeychainService`). Two flows:

- **Natural-language capture** — `NaturalLanguageTaskParser` turns "submit report
  fri 5pm !!" into a `TaskDraft`. It runs on-device heuristics first
  (`DateExpressionParser`) and only escalates to the LLM when configured.
- **Plan my day** — `AIService.planDay()` feeds today's tasks to the planner
  prompt and returns an ordered, time-blocked plan.

On-device Apple Foundation Models can later back `AIClient` for the fast/offline
path; the seam doesn't change.
