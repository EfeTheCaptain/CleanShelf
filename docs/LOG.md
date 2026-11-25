# CleanShelf Improvement Log

## 2026-11-25 - Project Audit & Planning
- Audited full codebase (15 overlay modules, background, manifest, styles)
- Created SPEC.md with 18 identified issues across security, code quality, bugs, performance, UX
- Created ROADMAP.md with 5 milestones
- Git baseline: commit 21268a2 (v1.2.8)

## 2026-11-25 - Milestone 1: Security & Critical Fixes (COMPLETED)
- Added CSP to manifest.json: `script-src 'self' 'wasm-unsafe-eval'; object-src 'none';`
- Fixed i18n innerHTML XSS vector: added `sanitizeHtml()` allowlist (strong, b, em, i, br, span)
- Fixed optional chaining in i18n: `CS.state?.settings?.language` in `t()` and `applyTranslations()`
- Cleaned up singleton guard in overlay-constants.js: removed `globalThis.CleanShelf = { aborted: true }` side effect
- Removed duplicate dark-sepia theme definition from overlay-styles.js (was defined twice)
- All changes verified by reading modified files

## 2026-11-25 - Milestone 2: Code Quality Tooling (IN PROGRESS)
- Task: Add ESLint config
- Task: Add Prettier config
- Task: Add TypeScript declaration files (.d.ts)
- Task: Add JSDoc types to module exports