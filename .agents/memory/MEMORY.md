# Memory index

Direction and hard facts for OpenFocus. One line per fact.

- **What** — OpenFocus: a native Swift/SwiftUI todo app for macOS 26 + iOS 26, replacing Todoist. Liquid Glass design, iCloud sync, AI planning agent.
- **No monorepo** — pure native app; the GitHub repo is also the marketing page. No server, no JS, no Electron/React Native.
- **Layers** — `OpenFocusCore` (pure engine, no SwiftData) → `OpenFocusData` (SwiftData @Model + @Observable services + CloudKit-ready ModelContainer) → `Sources/{App,Features,SharedUI,Platform}` SwiftUI app + `Sources/CLI` `openfocus` tool. See ARCHITECTURE.md.
- **Build** — `Package.swift` builds engine+CLI+tests (TDD loop; `OPENFOCUS_SKIP_SWIFTDATA=1` on CLT hosts). The app is generated from `project.yml` via `xcodegen` — never hand-edit `.xcodeproj`.
- **Glass** — chrome only (sidebar/toolbar/quick-add/prominent CTA), never on content rows. Built against macOS 26 SDK so native components adopt glass automatically. See `.agents/skills/liquid-glass/SKILL.md`.
- **Sync** — store is CloudKit-ready but ships local-only (`cloudKitDatabase: .none`) so it builds with no Apple team. Enable: add iCloud entitlement + team, flip to `.automatic`.
- **AI** — `AIClient` seam; `OpenRouterAIClient` (OpenAI-compatible) with key in Keychain. NL capture (on-device heuristics first) + `planDay()`. Apple Foundation Models can back the seam later.
- **Accent** — Todoist-style red (`#DC4C3E`) as the app accent, honoring the Todoist UI reference while staying fully native glass.
