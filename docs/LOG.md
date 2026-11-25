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

## 2026-11-25 - Milestone 2: Code Quality Tooling (COMPLETED)

- Added ESLint config (eslint.config.js) with flat config, browser globals, recommended rules
- Added Prettier config (.prettierrc) with consistent formatting
- Added TypeScript declaration file (types/cleanshelf.d.ts) with full module interfaces
- Added JSDoc `@typedef` and `@type` annotations to all 15 overlay modules
- Added @types/chrome for Chrome API types
- Added tsconfig.json for type checking
- Added package.json with npm scripts: lint, lint:fix, format, format:check, typecheck, build
- Fixed all ESLint errors (empty catch blocks)
- Formatted all files with Prettier
- TypeScript check passes (no errors)
