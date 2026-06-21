# OpenTodo

Entry point for Claude Code working in this repo. See [AGENTS.md](AGENTS.md) for the full orientation.

## Quick facts

- Native Swift / SwiftUI app for **macOS 26 + iOS 26** (Liquid Glass). No monorepo, no server.
- Layers: `TodoCore` (pure engine) → `TodoData` (SwiftData + services) → app/CLI shells.
- Xcode project is generated from `project.yml` via `xcodegen`. Don't edit `.xcodeproj`.

## Before substantial changes

Read `.agents/memory/MEMORY.md`, [ARCHITECTURE.md](ARCHITECTURE.md), and
`.agents/skills/liquid-glass/SKILL.md`.

## Testing policy

TDD; new features ship with tests; aim for 80%+ on new code; run tests before committing.
