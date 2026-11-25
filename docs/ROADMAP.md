# CleanShelf Improvement Roadmap

## Milestone 1: Security & Critical Bug Fixes

**Target**: 1 session
**Done when**:

- [ ] CSP added to manifest.json with `script-src 'self' 'wasm-unsafe-eval'; object-src 'none';`
- [ ] i18n `innerHTML` replaced with safe DOM construction or DOMPurify-style sanitization
- [ ] Optional chaining added to `overlay-i18n.js:276` for `CS.state?.settings?.language`
- [ ] Singleton guard in `overlay-constants.js` cleaned up (no `aborted: true` side effect)
- [ ] All existing functionality verified manually

## Milestone 2: Code Quality Tooling

**Target**: 1 session
**Done when**:

- [ ] ESLint config added (eslint.config.js) with recommended rules for browser extensions
- [ ] Prettier config added (.prettierrc)
- [ ] TypeScript declaration files (.d.ts) created for all CS modules
- [ ] JSDoc `@typedef` and `@type` annotations added to module exports
- [ ] `npm lint` and `npm format` scripts work
- [ ] Duplicate dark-sepia theme removed from `overlay-styles.js`

## Milestone 3: Modularization & Maintainability

**Target**: 2 sessions
**Done when**:

- [ ] `overlay-snippets.js` split into: `snippets-render.js`, `snippets-folders.js`, `snippets-dragdrop.js`, `snippets-persistence.js`, `snippets-index.js` (re-exports)
- [ ] `overlay-index.js` split into: `ui-build.js`, `ui-events.js`, `ui-lifecycle.js`, `index.js` (re-exports)
- [ ] CSS extracted to `styles/themes.css`, `styles/layout.css`, `styles/components.css`, `styles/overrides.css`
- [ ] Build script (`build.js`) concatenates overlay files in correct dependency order
- [ ] `background.js` updated to inject built bundle or individual files via flag
- [ ] All functionality verified after split

## Milestone 4: Test Coverage

**Target**: 1 session
**Done when**:

- [ ] Vitest configured for JSDOM environment
- [ ] Unit tests for: `storage`, `i18n`, `drafts`, `clipboard`, `export-import`, `constants`
- [ ] Integration tests for: snippet CRUD, folder operations, drag-drop logic (mocked DOM)
- [ ] `npm test` runs all tests and passes
- [ ] Coverage threshold: 70% for tested modules

## Milestone 5: Performance & UX Polish (Stretch)

**Target**: 1 session
**Done when**:

- [ ] Virtualized list rendering for >100 snippets (IntersectionObserver or simple windowing)
- [ ] Keyboard navigation: ArrowUp/Down, Home, End, Enter to copy, Escape to close
- [ ] Search highlighting: wrap matching text in `<mark>` in snippet cards
- [ ] Focus management audit: every action restores focus to logical element
- [ ] No regression in existing features

## Rollback Strategy

- Each milestone committed separately with descriptive messages
- `git tag milestone-1-security`, `milestone-2-tooling`, etc.
- If any milestone breaks production behavior: `git checkout <tag>` and re-plan
- `docs/LOG.md` appended with summary after each milestone

## Dependencies

- Milestone 1 blocks nothing (pure fixes)
- Milestone 2 enables Milestone 3 (linting validates splits)
- Milestone 3 enables Milestone 4 (modular code is testable)
- Milestone 5 independent, can be done anytime after 1
