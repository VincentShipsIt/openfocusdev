---
name: liquid-glass
description: >-
  Adopt Apple's Liquid Glass design language (macOS 26 / iOS 26 "Tahoe") correctly
  in SwiftUI. Use when asked to apply "glass", "liquid glass", "Apple glass design",
  or modernize an app's chrome to the macOS 26 look. Covers glassEffect,
  GlassEffectContainer, .glass / .glassProminent button styles, and — critically —
  the restraint rules (glass is the navigation/control layer, NOT a coat of paint
  for every view).
---

# Liquid Glass adoption (macOS 26 / iOS 26)

Liquid Glass is the translucent, dynamic material introduced at WWDC25 for the
macOS 26 "Tahoe" / iOS 26 generation. It sits on the **navigation and control
layer** — sidebars, toolbars, tab bars, floating action controls, prominent
buttons — refracting and sampling the content scrolling behind it. It is **not**
a background texture for content cards, lists, or whole screens.

The single most common mistake is over-application: coating every card, row, and
panel in glass. That produces a muddy, low-contrast UI and is explicitly against
Apple's guidance. **Restraint is the design.**

## The one rule that fixes most "ugly glass" bugs

When an app is built against the **macOS 26 / iOS 26 SDK**, standard components —
`NavigationSplitView` sidebars, `.toolbar`, `List(.sidebar)` selection, `TabView`,
default `Button` — **adopt Liquid Glass automatically**. You get it for free.

Therefore: **stop fighting the system.** The usual cause of a broken-looking
selection chip or muddy sidebar is *custom* styling layered on top of the native
component:

- A custom `RoundedRectangle().fill(Color.accentColor)` selection pill inside a
  `List(.sidebar)` row → double selection, wrong insets. **Fix: delete the pill.**
- `.scrollContentBackground(.hidden)` + `.background(Color.clear)` on a sidebar so
  a full-bleed gradient shows through → the glass material never renders.
  **Fix: remove those, let the system draw the sidebar material.**
- A heavy full-window gradient behind a `NavigationSplitView` → glass has nothing
  neutral to refract and looks flat. **Fix: remove it (or keep it subtle, behind
  content only).**

Audit for custom chrome styling and *remove* it before adding any `.glassEffect`.

## API reference

### Built-in button styles (prefer these)
```swift
Button("Primary")   { } .buttonStyle(.glassProminent)  // the single primary CTA
Button("Secondary") { } .buttonStyle(.glass)           // secondary / toolbar
```

### glassEffect — for genuinely custom controls only
```swift
// glassEffect(_ glass: Glass = .regular, in shape: some Shape = Capsule)
Text("Pill").padding().glassEffect()
view.glassEffect(in: .rect(cornerRadius: 16))
.glassEffect(.regular.tint(.accentColor).interactive(), in: .capsule)
```
Styles: `.regular` (default), `.clear`, `.identity`. Modifiers: `.tint(_)` (sparingly),
`.interactive()` (ONLY on tappable elements — never static content).

### GlassEffectContainer — group adjacent glass shapes
Glass samples a region larger than itself; adjacent glass in different containers
can't sample each other. Group a cluster (e.g. a row of toolbar buttons) in one
container, with `spacing` matching the layout.

## Do / Don't

**Do**
- Let standard sidebar / toolbar / tab bar / buttons adopt glass automatically.
- Use `.glassProminent` for the one primary action, `.glass` for secondary.
- Apply `.glassEffect` **after** padding and frame modifiers.
- Group adjacent glass shapes in one `GlassEffectContainer`; match its spacing.
- `.interactive()` only on tappable controls.

**Don't**
- Don't put glass on every card/row/panel. Content stays on standard materials.
- Don't stack glass on glass (nested `.glassEffect` / nested containers).
- Don't darken/gradient behind a toolbar — it conflicts with the scroll-edge effect.
- Don't tint heavily; tint is an accent, not a fill.

## OpenTodo helpers (this repo)

`Sources/SharedUI/Theme/GlassStyle.swift` centralizes the vocabulary — the app's
minimum is macOS 26 / iOS 26, so the helpers call the glass APIs unconditionally
(no `if #available`, no fallback). Use these instead of raw glass APIs:

- `.selectableGlass(selected:tint:in:)` — a selectable glass surface (the
  idiomatic replacement for "opaque fill + stroke + clipShape" selection).
- `.floatingGlassCard(cornerRadius:)` — a floating glass card for secondary chrome
  (the quick-add bar, AI panels). Not for long-form body text.
- `GlassGroup { ns in ... }` — wraps a cluster in one `GlassEffectContainer` and
  hands you a `Namespace.ID` for `glassEffectID(_:in:)`.

In OpenTodo, glass lives on: the quick-add bar, the "Plan my day" CTA, the
sidebar/tab bar (automatic), and toolbar buttons. Task rows are **content** — they
stay on standard materials.
