# Contributing

## Setup

```bash
brew install xcodegen swiftlint
xcodegen generate
open OpenCheck.xcodeproj
```

## Dev loop

- **Engine / CLI:** `swift build` and `swift test`. On a Command Line Tools–only
  host (no full Xcode), set `TODO_SKIP_SWIFTDATA=1` to drop the SwiftData targets.
- **App:** build the `OpenCheck-macOS` or `OpenCheck-iOS` scheme in Xcode, or
  `xcodebuild -scheme OpenCheck-macOS -destination 'platform=macOS' build`.
- Regenerate the project after editing `project.yml`: `xcodegen generate`.

## Standards

- Swift 5 language mode, 4-space indent, SwiftLint clean (`.swiftlint.yml`).
- Keep logic in `OpenCheckCore` / `OpenCheckData`; views stay thin.
- Glass is chrome only — read `.agents/skills/liquid-glass/SKILL.md` before touching UI materials.
- TDD: new behavior ships with tests; aim for 80%+ coverage on new code.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).

## Don't

- Don't hand-edit `OpenCheck.xcodeproj` (generated from `project.yml`).
- Don't add a server, a JS toolchain, or reintroduce a monorepo.
- Don't coat content in glass.
