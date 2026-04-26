# Design: Remove Update-Check Hook

**Date:** 2026-04-26
**Status:** Approved approach selected, pending final user review
**Branch:** `main`

---

## Summary

Remove the `gsd-check-update` feature completely from the repository as a follow-up to the upstream merge. This includes the shipped hook files, installer registration logic, Codex hook generation, targeted docs, and tests that only exist to validate the update-check hook.

The goal is to make the repository consistent with the fork policy: no session-start background update check, no shipped update-check hook artifacts, and no stale references that would re-enable or document the feature.

---

## Scope

**In scope:**
- Delete `hooks/gsd-check-update.js`
- Delete `hooks/gsd-check-update-worker.js`
- Remove hook shipping from `scripts/build-hooks.js`
- Remove installer registration/copy/uninstall logic for the update-check hook in `bin/install.js`
- Remove Codex hook block generation for the update-check hook
- Update docs and inventory files so the feature is no longer documented
- Remove or rewrite tests that explicitly validate update-check behavior
- Keep the repository test suite green after removal

**Out of scope:**
- Changing unrelated hook behavior
- Changing versioning, changelog policy, or release flow beyond references to this hook
- Reworking `gsd-statusline.js` unless test failures force a compatibility change

---

## Design Decisions

### 1. Full removal, not soft-disable

The feature will be removed from shipped artifacts and installer behavior, not merely disabled at runtime. This avoids dead code, dead tests, and future accidental reintroduction through installer paths.

### 2. Preserve statusline cache-read fallback unless it becomes invalid

`gsd-statusline.js` currently reads the historical update cache file. That read is harmless compatibility behavior. It does not itself perform network activity or trigger updates. It should remain unless the removal leaves it misleading or breaks tests.

### 3. Remove test coverage that only exists for the deleted feature

Tests whose sole purpose is validating update-check behavior should be removed. Tests that cover broader installer behavior should be updated to reflect the new no-update-hook state rather than deleted wholesale.

---

## File-Level Plan

### Hook files
- Delete `hooks/gsd-check-update.js`
- Delete `hooks/gsd-check-update-worker.js`

### Hook build and installation
- Remove update-check files from `scripts/build-hooks.js`
- Remove update-check hook handling from `bin/install.js`:
  - bundled hook copy assumptions
  - uninstall hook lists
  - settings cleanup matchers
  - `SessionStart` hook registration
  - Codex `config.toml` hook insertion
  - related warnings/messages

### Docs
- Remove update-check entries from:
  - `docs/ARCHITECTURE.md`
  - `docs/INVENTORY.md`
  - `docs/INVENTORY-MANIFEST.json`
- Update any operational docs that still instruct users to clear or rely on update-check hook behavior

### Tests
- Remove tests that require the deleted hook files or their worker implementation
- Update installer/Codex/config tests so they assert absence of the update hook rather than presence
- Keep cache/statusline tests only if they still reflect supported behavior after removal

---

## Verification Plan

1. Run targeted tests for installer/hook/Codex areas while removing the feature.
2. Run the full `npm test` suite once the tree is consistent.
3. Confirm `git diff --check` passes.
4. Confirm no remaining tracked references to `gsd-check-update.js` or `gsd-check-update-worker.js` remain outside intentional historical strings such as migration tests, if any are still justified.

---

## Risks

### Risk: partial removal leaves installer inconsistency

Mitigation: remove all registration paths together, then run targeted installer and Codex tests before the full suite.

### Risk: statusline tests still assume update-check artifacts exist

Mitigation: evaluate those tests after code removal and either preserve the harmless cache-read fallback or adjust the tests to the intended compatibility behavior.

### Risk: legacy migration tests become meaningless

Mitigation: if the product no longer installs the hook at all, tests whose only point is migrating legacy update-check hook entries should be removed rather than preserved as dead behavior tests.
