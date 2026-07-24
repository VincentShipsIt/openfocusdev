<h1 align="center">OpenFocus</h1>

<p align="center">
  <strong>A fast, native, AI-native task manager for Mac & iPhone.</strong><br>
  Liquid Glass design. iCloud sync. A planning agent for your day.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-macOS%2026%20%7C%20iOS%2026-black?logo=apple" alt="macOS 26 | iOS 26">
  <img src="https://img.shields.io/badge/Swift-6.3-orange?logo=swift" alt="Swift 6.3">
  <img src="https://img.shields.io/badge/UI-SwiftUI%20%2B%20Liquid%20Glass-blue?logo=swift" alt="SwiftUI + Liquid Glass">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

---

> **Pre-alpha.** Built in public. A native replacement for Todoist — no Electron,
> no React Native, no server to run. Pure Swift, on-device, synced over your own iCloud.

## Why

A to-do app should feel instant, live natively on every Apple device, and quietly
do the boring parts for you. OpenFocus is a **single SwiftUI codebase** for macOS 26
and iOS 26, persisting locally with **SwiftData**, syncing **Mac ↔ iPhone** over
your private iCloud, and acting on your day through an **AI planning agent**.

## What's here

A single Swift package with surfaces over one engine:

| Surface        | What it is                                                              |
| -------------- | ---------------------------------------------------------------------- |
| `OpenFocusCore`     | The engine: models, AI client seam, natural-language date parsing. No UI, no DB. |
| `OpenFocusData`     | SwiftData `@Model` types + services + the CloudKit-ready store.        |
| `OpenFocus`     | The SwiftUI app for **macOS + iOS**, built with Xcode (Liquid Glass).  |
| `openfocus`         | A scriptable CLI sharing the exact same engine.                        |

## Features

- **Today / Upcoming / Inbox / Projects** — the views you expect, fully native.
- **Liquid Glass** chrome — sidebar, toolbars, and the quick-add bar adopt
  macOS 26 / iOS 26 glass; content stays crisp and legible.
- **Quick add with natural language** — "submit report fri 5pm !!" → a dated,
  prioritized task (on-device heuristics, with an LLM for the hard cases).
- **Plan my day** — an AI agent reads today's tasks and proposes an ordered,
  time-blocked plan.
- **Offline-first** — every write is instant and local; sync reconciles in the
  background.

## Build

```bash
brew install xcodegen swiftlint   # one-time
xcodegen generate                 # project.yml -> OpenFocus.xcodeproj
open OpenFocus.xcodeproj            # run OpenFocus-macOS or OpenFocus-iOS

# or, from the terminal:
xcodebuild -scheme OpenFocus-macOS -destination 'platform=macOS' build
swift build && swift test         # pure engine (OpenFocusCore) + CLI
```

## Status

| Area              | State                                             |
| ----------------- | ------------------------------------------------- |
| Native SwiftUI    | ✅ macOS + iOS, one codebase                       |
| Liquid Glass      | ✅ chrome layer (sidebar / toolbar / quick-add)    |
| Local persistence | ✅ SwiftData                                        |
| iCloud sync       | 🔧 store is CloudKit-ready — flip on with your team |
| AI planning agent | 🔧 engine wired; bring an API key                  |

See [ARCHITECTURE.md](ARCHITECTURE.md) for the design and how to enable iCloud sync.

## TestFlight releases

OpenFocus uses the same Apple credential names as MeterBar, MacSweep, and
OpenTVTracker. Configure them under the repository Actions settings. The
upload job itself runs in the protected `release` environment:

| Kind | Name | Purpose |
| --- | --- | --- |
| Variable | `APPLE_TEAM_ID` | Apple Developer team used for automatic signing |
| Variable | `APPLE_API_KEY_ID` | App Store Connect API key identifier |
| Variable | `APPLE_API_ISSUER_ID` | App Store Connect API issuer identifier |
| Secret | `APPLE_API_PRIVATE_KEY_P8_BASE64` | Base64-encoded App Store Connect `.p8` private key |

The private key must belong to the key ID and issuer configured above and have
permission to manage signing assets and upload builds. Keep the raw `.p8` file
out of the repository.

- Pull requests run an unsigned iPhone Simulator build through `ci.yml`.
- Pushing a semantic version tag such as `v0.1.0` archives and uploads that
  commit through `testflight.yml`. The tagged commit must already be on the
  repository default branch.
- The TestFlight workflow can also be dispatched manually with an `X.Y.Z`
  marketing version from a default-branch commit. Its build number uses
  `<run-number>.<run-attempt>` (for example, `42.1`; a rerun becomes `42.2`),
  so every attempt has a distinct App Store build string.
- Signing material is decoded only on the ephemeral runner and deleted in the
  workflow cleanup step.

## License

MIT — see [LICENSE](LICENSE).
