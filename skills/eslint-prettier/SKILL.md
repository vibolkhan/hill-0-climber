---
name: eslint-prettier
description: Use ESLint and Prettier consistently for JavaScript, TypeScript, React, Vue, Node, and frontend codebases. Use when Codex needs to add, configure, run, fix, or review ESLint syntax rules, Prettier formatting, lint scripts, format scripts, editor integration, pre-commit checks, or code style cleanup.
---

# ESLint Prettier

Use this skill to keep code syntax, style, and formatting consistent with ESLint and Prettier.

## Core Standard

Use ESLint for code correctness, syntax rules, imports, framework rules, and maintainability issues.

Use Prettier for formatting only: whitespace, wrapping, quotes, semicolons, trailing commas, and similar presentation rules.

Do not make ESLint and Prettier fight over formatting. Prefer a Prettier-compatible ESLint setup.

## Workflow

1. Inspect the project before changing configuration:
   - `package.json`
   - existing ESLint config
   - existing Prettier config
   - TypeScript config
   - framework config
   - package manager lockfile
2. Reuse the project's current package manager and config style.
3. Prefer existing scripts such as `lint`, `format`, `format:check`, `typecheck`, or `check`.
4. Run Prettier before final lint verification when formatting changes are expected.
5. Run ESLint after formatting to catch real code issues.
6. Fix specific lint findings instead of weakening rules broadly.

## Configuration Guidance

- Use the current ESLint config format: flat config (`eslint.config.*`) or legacy config (`.eslintrc.*`).
- Use TypeScript-aware linting only when the project already has TypeScript and the parser setup is appropriate.
- Use framework plugins when relevant, such as React, React Hooks, Next.js, Vue, Svelte, or import plugins.
- Use `eslint-config-prettier` or the framework's equivalent compatibility setup to disable formatting rules that conflict with Prettier.
- Avoid adding `eslint-plugin-prettier` unless the project already uses it or explicitly wants formatting reported as ESLint errors.
- Keep Prettier config small and conventional. Do not overfit style rules unless the repo already has a strong style.

## Package Scripts

Prefer scripts like:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

Adjust paths and extensions to match the repo. Avoid formatting generated files, build output, lockfiles, or vendored code unless the repo already does.

## Fixing Code

- Use `eslint --fix` for safe mechanical lint fixes.
- Use Prettier for formatting instead of manual whitespace churn.
- Manually fix semantic lint errors: unused variables, missing dependencies, unsafe `any`, unhandled promises, hook dependency issues, accessibility issues, and import problems.
- Remove dead code when it is clearly unused and safe to remove.
- Rename intentionally unused variables with the repo's accepted convention, often a leading underscore.
- Add narrow `eslint-disable-next-line` comments only when there is a real false positive or deliberate exception. Include a reason when the codebase convention supports it.

## TypeScript

- Keep ESLint and `tsc` responsibilities separate.
- Use `typescript-eslint` rules for lint-level TypeScript quality, not as a replacement for type checking.
- Run the repo's typecheck script when lint changes touch types, parser options, module resolution, or TypeScript source.
- Avoid changing `tsconfig` broadly just to satisfy lint unless the lint setup cannot work otherwise.

## Prettier

- Respect existing `.prettierrc`, `prettier.config.*`, or package-level Prettier settings.
- Add `.prettierignore` when needed to exclude build output, generated files, coverage, dependency folders, and large artifacts.
- Let Prettier own formatting decisions. Do not manually reformat code in a different style after running it.
- Use check mode in CI-style verification and write mode for local cleanup.

## Verification

Before finishing, run the most relevant available commands:

- package install only if required and approved by the environment
- `lint`
- `format:check` or `format`
- `typecheck` when TypeScript or typed linting is involved
- tests when lint fixes could change behavior

If a command cannot run, report the exact blocker and what remains unverified.

## Review Checklist

Before handing off, check:

- ESLint and Prettier configs both exist or the repo intentionally relies on defaults.
- Prettier does not conflict with ESLint formatting rules.
- Scripts use the existing package manager and naming conventions.
- Ignored files cover generated and dependency output.
- Lint fixes did not hide problems with broad disables.
- TypeScript, framework, and import rules match the actual stack.
- The final codebase passes the available lint and formatting checks, or unresolved failures are clearly reported.

