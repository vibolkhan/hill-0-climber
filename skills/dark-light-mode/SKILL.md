---
name: dark-light-mode
description: Add, improve, or review dark mode and light mode support for websites, apps, dashboards, components, and design systems. Use when Codex needs to implement theme switching, system color-scheme support, theme tokens, persistent user theme preference, accessible dark/light palettes, or QA for both color modes.
---

# Dark Light Mode

Use this skill to implement or review dark and light mode as a complete theme system, not as a one-off color swap.

## Core Standard

Support three theme states unless the user asks otherwise:

- `light`: force light mode.
- `dark`: force dark mode.
- `system`: follow the user's OS/browser preference.

Use theme tokens for semantic roles. Avoid scattering raw colors through components.

## Workflow

1. Inspect the existing styling approach: CSS variables, Tailwind, CSS modules, styled components, design tokens, or framework theme provider.
2. Reuse the existing pattern before adding a new theme abstraction.
3. Define semantic tokens for both modes.
4. Add a theme controller only where the app naturally exposes settings or global controls.
5. Persist explicit user preference and respect system preference when set to `system`.
6. Verify both modes across core screens, states, and responsive breakpoints.

## Token Model

Prefer semantic token names:

- `background`, `surface`, `surfaceElevated`
- `text`, `textMuted`, `textSubtle`
- `border`, `borderStrong`
- `primary`, `primaryHover`, `primaryText`
- `danger`, `warning`, `success`, `info`
- `focus`, `selection`, `shadow`

Keep raw palette values behind tokens. Components should reference the role they need, not a color name like `slate900` or `gray50`.

## Implementation Rules

- Apply the active theme at the document root using an existing convention such as `data-theme`, a root class, or the framework theme provider.
- Set `color-scheme: light dark` or the current active scheme where appropriate so native controls render correctly.
- Persist only explicit user choices. If the user chooses `system`, let media query changes update the active theme.
- Avoid flashes of the wrong theme on load by applying the saved preference before first paint when the stack allows it.
- Use CSS variables for browser-native styling stacks unless the codebase already has a better token system.
- Keep images, shadows, borders, charts, syntax colors, and focus rings readable in both modes.

## Palette Guidance

- Light mode should not be pure white everywhere. Use subtle surface separation.
- Dark mode should not be pure black everywhere unless the product intentionally uses OLED styling.
- Avoid simply inverting colors.
- Reduce saturated colors in dark mode when they vibrate against dark surfaces.
- Ensure muted text is still readable and disabled text is visibly distinct from enabled text.
- Recheck brand colors in both modes instead of assuming one brand color works everywhere.

## Interaction

- Use a recognizable theme control: segmented control, menu item, settings radio group, or icon button with a menu for `Light`, `Dark`, and `System`.
- Use sun/moon/system icons when an icon library is already available.
- Make the control keyboard accessible and label it for screen readers.
- Do not place theme controls where they distract from the primary workflow unless the app already has a global toolbar or settings area.

## Accessibility

- Meet contrast requirements for normal text, large text, icons that communicate meaning, focus states, borders that define controls, and status colors.
- Do not rely on color alone for status or selection.
- Preserve visible focus rings in both themes.
- Respect reduced motion for animated theme transitions.
- Test native form controls, scrollbars, selection color, and disabled states.

## QA Checklist

Before finishing, check:

- Theme preference survives reload.
- `system` follows OS/browser theme changes.
- First paint does not visibly flash the wrong theme.
- All core routes or views work in light and dark mode.
- Modals, menus, popovers, tooltips, forms, tables, charts, and empty/error/loading states are themed.
- Text, icons, dividers, borders, shadows, and focus rings remain visible.
- Images and logos still work on both backgrounds.
- Mobile and desktop layouts both look intentional.
- No component still contains hard-coded colors that break either mode.

## Existing UI Changes

- Keep edits close to the current styling architecture.
- Migrate repeated hard-coded colors to tokens when needed, but avoid broad refactors unrelated to theme support.
- If a design system exists, add or map mode-specific tokens there first.
- When the app already has theme support, fix gaps instead of replacing it.

