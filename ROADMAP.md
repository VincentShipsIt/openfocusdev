# OpenFocus Roadmap

OpenFocus is becoming a native, local-first personal replacement for Todoist on
Apple platforms. The target is not a screen-for-screen clone. The target is the
same trusted personal workflow: capture quickly, organize deeply, plan clearly,
act from every Apple surface, and keep ownership of the data.

This file is the canonical product roadmap. GitHub milestones and issues are the
execution state for the work described here.

## Product boundary

### v1.0 parity means

- Personal tasks and projects can move from Todoist to OpenFocus without a
  known P0/P1 workflow or data gap.
- iPhone, iPad, Mac, widgets, system actions, and the planned Watch app are
  native surfaces over one shared engine and data layer.
- Core task management remains fully usable offline and without an AI provider.
- iCloud is the sync service; OpenFocus does not require an application server.
- Import, backup, restore, migration, and rollback are proven before release.

### v1.0 does not mean

- Team workspaces, roles, assignments, shared-project collaboration, threaded
  comments, mentions, or a hosted multi-user service.
- Android, Windows, browser extensions, email add-ons, or Todoist's integration
  marketplace.
- Copying Todoist Karma. OpenFocus can provide goals, streaks, and useful
  progress without reproducing its gamification system.

Those exclusions are product and architecture decisions, not forgotten work.

## Current assessment

OpenFocus has the correct foundation and a working thin slice:

- native macOS and iOS SwiftUI apps;
- local SwiftData persistence;
- Inbox, Today, Upcoming, Completed, and project lists;
- basic task creation and completion;
- dates, priorities, labels, notes, recurrence, and subtasks represented in the
  model to varying degrees;
- natural-language Quick Add;
- a read-only AI day plan;
- a shared CLI engine;
- a standardized TestFlight workflow with a valid uploaded beta build.

It is not yet a Todoist replacement. Task detail and project CRUD are incomplete,
iCloud and reminders are not release-verified, and most advanced organization,
planning, platform, portability, and migration workflows remain open.

**Directional estimate:** roughly one quarter of the v1.0 personal-replacement
scope is implemented or partially implemented. The architecture is ahead of the
product surface, which is the right trade: the remaining work can build on one
engine instead of being repeated per app.

At the 2026-07-23 audit, the roadmap contains 51 open milestone issues. Seven
are release trackers, leaving roughly 44 execution issues across product,
platform, data, testing, migration, and release work. Issue count is not an
effort estimate, but it makes the remaining scope unambiguous.

Status legend:

- ✅ usable implementation exists
- 🟡 model, engine, or partial surface exists
- ⬜ planned but not implemented
- 🚫 explicitly outside the v1.0 boundary

## Parity matrix

### Release and data foundation

| Capability | Status | Delivery |
| --- | --- | --- |
| Native macOS and iOS apps | ✅ | Current repository |
| Offline SwiftData store | ✅ | Current repository |
| Signed TestFlight upload workflow | ✅ | [#36](https://github.com/VincentShipsIt/openfocusdev/issues/36) |
| Complete task and project CRUD | 🟡 | [#33](https://github.com/VincentShipsIt/openfocusdev/issues/33) |
| iCloud sync and recovery states | ⬜ | [#24](https://github.com/VincentShipsIt/openfocusdev/issues/24) |
| Local reminders and notification settings | ⬜ | [#27](https://github.com/VincentShipsIt/openfocusdev/issues/27) |
| Full settings and diagnostics | 🟡 | [#10](https://github.com/VincentShipsIt/openfocusdev/issues/10) |
| SwiftData service test coverage | 🟡 | [#23](https://github.com/VincentShipsIt/openfocusdev/issues/23) |

### Capture and task semantics

| Capability | Status | Delivery |
| --- | --- | --- |
| Natural-language Quick Add | 🟡 | Current parser and Quick Add surface |
| Task title, notes, project, date, priority, and labels | 🟡 | [#33](https://github.com/VincentShipsIt/openfocusdev/issues/33) |
| Deadlines, duration, all-day, fixed, and floating time | ⬜ | [#50](https://github.com/VincentShipsIt/openfocusdev/issues/50) |
| Recurrence engine and editor | 🟡 | [#30](https://github.com/VincentShipsIt/openfocusdev/issues/30) |
| Nested subtasks and parent progress | 🟡 | [#8](https://github.com/VincentShipsIt/openfocusdev/issues/8) |
| Manual task ordering | 🟡 | [#7](https://github.com/VincentShipsIt/openfocusdev/issues/7) |
| Multiple, deadline-relative, and location reminders | ⬜ | [#69](https://github.com/VincentShipsIt/openfocusdev/issues/69) |
| Global Mac capture and iOS Share Extension | ⬜ | [#12](https://github.com/VincentShipsIt/openfocusdev/issues/12) |
| Text, image, scan, and document-assisted capture | ⬜ | [#59](https://github.com/VincentShipsIt/openfocusdev/issues/59) |

### Projects, discovery, and planning

| Capability | Status | Delivery |
| --- | --- | --- |
| Inbox, Today, Upcoming, Completed, and projects | 🟡 | Current shared list surface |
| Project rename/delete and safe task fallback | 🟡 | [#33](https://github.com/VincentShipsIt/openfocusdev/issues/33) |
| Sections, sub-projects, and favorites | ⬜ | [#62](https://github.com/VincentShipsIt/openfocusdev/issues/62) |
| Labels, saved filters, and smart filters | 🟡 | [#6](https://github.com/VincentShipsIt/openfocusdev/issues/6) |
| Cross-project task search | ⬜ | [#48](https://github.com/VincentShipsIt/openfocusdev/issues/48) |
| Bulk edit, sort, and group | ⬜ | [#52](https://github.com/VincentShipsIt/openfocusdev/issues/52) |
| List, board, and calendar layouts | ⬜ | [#56](https://github.com/VincentShipsIt/openfocusdev/issues/56) |
| Templates, CSV portability, and backups | ⬜ | [#61](https://github.com/VincentShipsIt/openfocusdev/issues/61) |
| Completed archive and personal activity history | 🟡 | [#49](https://github.com/VincentShipsIt/openfocusdev/issues/49) |
| Personal attachments and task-notes timeline | ⬜ | [#70](https://github.com/VincentShipsIt/openfocusdev/issues/70) |

### Apple app parity

| Capability | Status | Delivery |
| --- | --- | --- |
| Todoist-style Home/Lock Screen and Mac widgets | ⬜ | [#47](https://github.com/VincentShipsIt/openfocusdev/issues/47) |
| Mobile navigation, swipes, context menus, and Dynamic Add | ⬜ | [#55](https://github.com/VincentShipsIt/openfocusdev/issues/55) |
| First-class iPad split workspace and multiwindow | ⬜ | [#58](https://github.com/VincentShipsIt/openfocusdev/issues/58) |
| Shortcuts, Siri, and iOS Controls | ⬜ | [#53](https://github.com/VincentShipsIt/openfocusdev/issues/53) |
| Apple Calendar context and optional linked events | ⬜ | [#68](https://github.com/VincentShipsIt/openfocusdev/issues/68) |
| Mac multiwindow, menu bar, startup, badge, and power commands | ⬜ | [#51](https://github.com/VincentShipsIt/openfocusdev/issues/51) |
| Signed and notarized Mac distribution | ⬜ | [#28](https://github.com/VincentShipsIt/openfocusdev/issues/28) |
| Apple Watch lists, capture, actions, and complications | ⬜ | [#60](https://github.com/VincentShipsIt/openfocusdev/issues/60) |

### Progress and intelligence

| Capability | Status | Delivery |
| --- | --- | --- |
| Read-only Plan my day | 🟡 | Current AI service and plan sheet |
| Apply a structured, reviewable day plan | ⬜ | [#26](https://github.com/VincentShipsIt/openfocusdev/issues/26) |
| Local Claude/Codex planning backends on Mac | 🟡 | [#25](https://github.com/VincentShipsIt/openfocusdev/issues/25) |
| Completion history, goals, streaks, and charts | ⬜ | [#9](https://github.com/VincentShipsIt/openfocusdev/issues/9) |
| Productivity and goal widgets | ⬜ | [#43](https://github.com/VincentShipsIt/openfocusdev/issues/43) |

### Migration and v1.0 quality

| Capability | Status | Delivery |
| --- | --- | --- |
| Guided and reversible Todoist import | ⬜ | [#57](https://github.com/VincentShipsIt/openfocusdev/issues/57) |
| Accessibility, localization, performance, privacy, and recovery hardening | ⬜ | [#54](https://github.com/VincentShipsIt/openfocusdev/issues/54) |
| Public product/help surface | ⬜ | [#11](https://github.com/VincentShipsIt/openfocusdev/issues/11) |
| Team collaboration and hosted workspaces | 🚫 | Outside the local-first personal product boundary |

## Release sequence

| Release | Outcome | Tracker |
| --- | --- | --- |
| v0.1 — TestFlight beta | Installable beta, complete basic CRUD, sync, reminders, settings, metadata, and exact-build QA | [#37](https://github.com/VincentShipsIt/openfocusdev/issues/37) |
| v0.2 — Widgets | Shared widget data foundation, configurable task widgets, inline completion, Quick Add, and Lock Screen glances | [#47](https://github.com/VincentShipsIt/openfocusdev/issues/47) |
| v0.3 — Core task parity | Complete task semantics, recurrence, subtasks, hierarchy, labels/filters, search, ordering, and advanced reminders | [#65](https://github.com/VincentShipsIt/openfocusdev/issues/65) |
| v0.4 — Planning & organization | Batching, sort/group, list/board/calendar, history, attachments, templates, portability, and backups | [#63](https://github.com/VincentShipsIt/openfocusdev/issues/63) |
| v0.5 — Apple app parity | First-class iPhone, iPad, Mac, Calendar, system action, and Watch experiences | [#66](https://github.com/VincentShipsIt/openfocusdev/issues/66) |
| v0.6 — Intelligence & insights | Trusted statistics, actionable planning, productivity widgets, local backends, and assisted capture | [#67](https://github.com/VincentShipsIt/openfocusdev/issues/67) |
| v1.0 — Personal Todoist replacement | Guided migration plus release-level quality, recovery, accessibility, and product support | [#64](https://github.com/VincentShipsIt/openfocusdev/issues/64) |

## Sequencing rules

1. Data semantics land before surfaces that expose them.
2. `OpenFocusCore` and `OpenFocusData` own behavior; app, widget, intent, CLI,
   menu-bar, and Watch targets remain thin shells.
3. Every persistent-model change includes a CloudKit-compatible migration,
   populated-store fixture, and rollback story.
4. Every gesture or drag interaction has a keyboard, button/menu, and VoiceOver
   alternative.
5. AI proposes; the user reviews. Core task management never depends on model
   availability.
6. Release trackers close only against exact signed builds and recorded
   verification evidence.
7. No implementation work lands directly on the default branch while its
   release checklist remains incomplete.

## Competitive baseline

The roadmap was audited on 2026-07-23 against Todoist's current official product
and help material:

- [Todoist features](https://www.todoist.com/features)
- [Tasks and planning](https://www.todoist.com/help/categories/features/tasks-and-planning)
- [Projects and sections](https://www.todoist.com/help/categories/features/projects-and-sections)
- [Filters and labels](https://www.todoist.com/help/categories/features/filters-and-labels)
- [Reminders and notifications](https://www.todoist.com/help/categories/features/reminders-and-notifications)
- [Comments and files](https://www.todoist.com/help/categories/features/comments-and-files)
- [iOS and mobile features](https://www.todoist.com/help/categories/features/android-and-ios-features)
- [Desktop features](https://www.todoist.com/help/categories/features/desktop-features)
- [Apple widgets](https://www.todoist.com/help/articles/use-a-todoist-widget-on-an-apple-device-ptRdme)
- [Productivity and Karma](https://www.todoist.com/help/categories/features/productivity-and-karma)
- [Todoist and AI](https://www.todoist.com/help/categories/features/todoist-and-ai)

## Planning review record

- Fable 5/high was unavailable with an HTTP 429 weekly limit during the widget
  roadmap review.
- The single Opus 4.8/high fallback returned no structured review payload and
  was treated as a provider/runtime failure, not approval.
- The expanded personal-parity roadmap used the required non-blocking
  `fallback_sol` lane rather than probing the capped profiles again.
- The documentation exact-head Opus review was attempted after the first draft,
  entered an unrequested tool-use loop, and emitted no structured verdict
  before the bounded run was stopped. No `PASS` was recorded.
- Exact-head Opus verification remains a delivery gate for implementation work;
  the planning fallback does not waive it.
