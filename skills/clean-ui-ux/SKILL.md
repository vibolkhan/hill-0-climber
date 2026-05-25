---
name: clean-ui-ux
description: Keep digital products visually clean, usable, accessible, and production-polished. Use when Codex designs, builds, edits, or reviews a website, app, dashboard, form, component, landing page, game UI, or any other user interface; use when the user asks for clean UX/UI, polished layout, modern UI, better usability, responsive design, visual QA, design cleanup, or interface review.
---

# Clean UI/UX

Use this skill to keep interfaces calm, clear, responsive, and useful. Treat it as a working checklist while designing, implementing, or reviewing UI.

## Core Standard

Create the actual usable experience first. Avoid decorative filler, marketing fluff, and oversized sections unless the product explicitly needs a landing page.

Prefer interfaces that are:

- Clear: users can immediately understand where they are, what matters, and what they can do.
- Efficient: common actions are close to the content they affect.
- Stable: hover states, labels, validation, loading, and dynamic content do not shift the layout.
- Accessible: contrast, focus states, hit targets, semantics, and keyboard behavior are covered.
- Responsive: desktop and mobile both feel intentionally designed.

## Workflow

1. Identify the user goal, the primary workflow, and the core content.
2. Scan existing UI patterns before adding new ones.
3. Build the smallest complete interface that supports the workflow.
4. Check visual hierarchy, spacing, alignment, responsiveness, and empty/error/loading states.
5. Run or inspect the UI where possible, using screenshots for frontend work.
6. Fix visible polish issues before declaring the task complete.

## Layout

- Use predictable structure: navigation, content, controls, feedback, and secondary details should each have a clear place.
- Keep page sections unframed unless a card or panel represents a real object, repeated item, modal, or tool surface.
- Do not nest cards inside cards.
- Use grids, flex constraints, aspect ratios, min/max sizes, and stable icon-button dimensions to prevent reflow.
- Keep text inside its container at all supported widths. Let labels wrap naturally before shrinking type.
- Avoid viewport-width font scaling. Use type scales, container constraints, and responsive layout changes instead.
- Make dense tools scannable: compact headings, close controls, clear grouping, and restrained whitespace.

## Interaction

- Use familiar controls: icon buttons for obvious tools, segmented controls for modes, toggles or checkboxes for binary choices, sliders or inputs for numeric values, tabs for peer views, and menus for option sets.
- Add tooltips for icon-only or uncommon controls.
- Make primary actions obvious without making every action visually loud.
- Provide empty, loading, error, disabled, success, and destructive states when the workflow can reach them.
- Preserve keyboard access and visible focus for interactive elements.
- Keep hit targets comfortable, especially on touch screens.

## Visual Polish

- Use a limited, balanced palette. Avoid one-note interfaces dominated by a single hue family.
- Avoid generic gradient blobs, decorative orbs, bokeh backgrounds, and ornamental SVGs unless the product specifically calls for them.
- Use real, relevant, or generated bitmap imagery when a site needs visual assets; imagery should show the product, place, person, state, or gameplay clearly.
- Use icons from the app's existing icon library when available.
- Keep cards at 8px radius or less unless the existing design system uses another radius.
- Keep letter spacing at `0` unless matching an existing system style.
- Avoid text that explains the UI inside the UI itself. Let labels, affordances, and layout do the work.

## Accessibility

- Ensure readable contrast for text, controls, borders that carry meaning, and focus rings.
- Use semantic elements and names for controls.
- Connect form labels, helper text, and errors.
- Do not rely only on color to communicate status.
- Support reduced motion or keep animations subtle and nonessential.

## Review Checklist

Before finishing, check:

- The first screen presents the real product or workflow, not a placeholder introduction.
- Primary and secondary actions are distinguishable.
- Text does not overlap, clip, or overflow on mobile or desktop.
- Repeated items align and scan cleanly.
- Empty, loading, and error states are not awkward holes.
- Forms are labeled, validated, and recoverable.
- Interactive elements have hover, active, disabled, and focus states.
- The UI avoids unnecessary cards, heavy decoration, and vague stock-like imagery.
- The implementation follows the existing codebase and design-system patterns.

## When Editing Existing UI

- Preserve established tokens, components, and naming conventions.
- Change the smallest surface that solves the usability or polish issue.
- Do not replace a mature local pattern with a new abstraction just for style preference.
- If a design system exists, reuse its components before creating new ones.

