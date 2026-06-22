# OpenCheck

Entry point for AI agents working in this repo.

## Orientation

- `.agents/memory/MEMORY.md` — repo memory index (direction + hard facts). Start here.
- [ARCHITECTURE.md](ARCHITECTURE.md) — how the code fits together and the layer boundaries.
- [CONTRIBUTING.md](CONTRIBUTING.md) and `.swiftlint.yml` — coding standards and dev setup.
- `.agents/skills/liquid-glass/SKILL.md` — how to apply Liquid Glass correctly (glass is chrome, not wallpaper).

## Hard rules

- **Native only.** Pure Swift / SwiftUI. No Electron, React Native, server, or monorepo.
- **One engine, many surfaces.** Logic lives in `OpenCheckCore` / `OpenCheckData`; the app and CLI are thin shells.
- **`project.yml` is the source of truth** for the Xcode project — never hand-edit `*.xcodeproj`. Run `xcodegen generate`.
- **Glass is restraint.** Apply glass to navigation/controls only; content rows stay on standard materials.

## Testing policy

- Write tests first (TDD); new features ship with tests.
- Aim for 80%+ coverage on new code.
- Run the relevant tests before committing.
