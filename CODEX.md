# OpenFocus

Entry point for Codex working in this repo. See [AGENTS.md](AGENTS.md) for the full orientation.

- Native Swift / SwiftUI app for **macOS 26 + iOS 26** (Liquid Glass). No monorepo, no server.
- Layers: `OpenFocusCore` (pure engine) → `OpenFocusData` (SwiftData + services) → app/CLI shells.
- Xcode project is generated from `project.yml` via `xcodegen`. Don't edit `.xcodeproj`.
- TDD; new features ship with tests; run tests before committing.
