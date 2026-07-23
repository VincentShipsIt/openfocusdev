# Contributing

## Setup

```bash
brew install xcodegen swiftlint
xcodegen generate
open OpenFocus.xcodeproj
```

## Dev loop

- **Engine / CLI:** `swift build` and `swift test`. On a Command Line Tools–only
  host (no full Xcode), set `OPENFOCUS_SKIP_SWIFTDATA=1` to drop the SwiftData targets.
- **App:** build the `OpenFocus-macOS` or `OpenFocus-iOS` scheme in Xcode, or
  `xcodebuild -scheme OpenFocus-macOS -destination 'platform=macOS' build`.
- Regenerate the project after editing `project.yml`: `xcodegen generate`.

### SwiftData service tests

`OpenFocusDataTests` is a hostless macOS unit-test target generated from
`project.yml`. Each test creates and retains its own in-memory `ModelContainer`
through the throwing `OpenFocusModelContainer.make(inMemory:)` entry point.
The app continues to use `live(inMemory:)`, which preserves its last-resort
in-memory launch fallback.

The suite was disabled after Xcode 26.6 test hosts trapped with signal 5 while
creating or fetching `@Model` instances with both in-memory and temporary-file
stores. The bounded workaround is to keep SwiftPM focused on the pure engine and
run the isolated SwiftData suite through its dedicated Xcode scheme in CI.
These tests intentionally do not cover on-disk migration or CloudKit behavior;
those require separate integration and device coverage.

## Standards

- Swift 5 language mode, 4-space indent, SwiftLint clean (`.swiftlint.yml`).
- Keep logic in `OpenFocusCore` / `OpenFocusData`; views stay thin.
- Glass is chrome only — read `.agents/skills/liquid-glass/SKILL.md` before touching UI materials.
- TDD: new behavior ships with tests; aim for 80%+ coverage on new code.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).

## Don't

- Don't hand-edit `OpenFocus.xcodeproj` (generated from `project.yml`).
- Don't add a server, a JS toolchain, or reintroduce a monorepo.
- Don't coat content in glass.
