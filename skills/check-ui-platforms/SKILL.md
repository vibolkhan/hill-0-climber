---
name: check-ui-platforms
description: Always verify frontend UI changes across iOS, Android, and web. Use when Codex builds, edits, reviews, or finishes any user-facing interface, including React Native, mobile apps, responsive web apps, hybrid apps, dashboards, design-to-code work, layout fixes, visual polish, or interaction changes that should behave consistently on iOS, Android, and web.
---

# Check UI Platforms

Before finishing user-facing UI work, verify the interface on iOS, Android, and web whenever the project supports those targets.

## Workflow

1. Identify the supported targets from the repo, scripts, framework, and user request.
2. Run the cheapest reliable build or typecheck for each supported target.
3. Launch or inspect the UI on each available target:
   - iOS: simulator, Expo/iOS preview, React Native iOS build, or platform-specific screenshot/test.
   - Android: emulator, Expo/Android preview, React Native Android build, or platform-specific screenshot/test.
   - Web: local dev server plus browser inspection for desktop and mobile-width viewports.
4. Check the same core flows on every target:
   - Initial load and primary screen.
   - Navigation and back behavior.
   - Forms, controls, gestures, hover/tap states, and disabled/loading/error states.
   - Keyboard behavior, safe areas, status/navigation bars, scrolling, overflow, and orientation-sensitive layouts.
   - Text wrapping, clipping, contrast, spacing, icon alignment, image rendering, and empty states.
5. Compare platform differences intentionally. Accept native differences, but fix accidental layout drift, missing functionality, broken assets, or platform-only errors.
6. Report exactly what was checked, what could not be checked, and why.

## Project Signals

Use local evidence before choosing commands:

- `package.json` scripts such as `ios`, `android`, `web`, `start`, `dev`, `build`, `test`, `lint`, or `typecheck`.
- Expo config, React Native config, Capacitor/Ionic config, Next/Vite config, native `ios/` or `android/` folders.
- Existing test tooling such as Playwright, Detox, Maestro, Jest, Vitest, Cypress, Storybook, or visual regression scripts.

## Verification Standard

Prefer real execution over static reasoning. If a target cannot be run because an emulator, simulator, device, dependency, network, credentials, or platform SDK is unavailable, do the next best local check and state the limitation clearly.

For web UI, use browser automation or screenshots when available after meaningful visual changes. Check at least one desktop viewport and one mobile viewport.

For iOS and Android UI, run platform builds or previews when the repo provides working commands. If only one mobile platform is available locally, still inspect code for platform-specific conditionals and call out the missing runtime check.

## Finish Criteria

Do not present UI work as complete until:

- Every supported target has either been exercised or explicitly marked unavailable.
- Any discovered platform-specific breakage has been fixed or documented.
- The final response includes a concise verification summary by target.
