# Remove Update-Check Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the shipped update-check hook and all installer, test, and doc references so the fork no longer performs or documents session-start update checking.

**Architecture:** First flip targeted tests to the desired no-hook behavior, then remove the runtime files and installer wiring, then clean up docs and obsolete tests. Keep `gsd-statusline.js` cache reads only if they remain harmless compatibility behavior and do not imply the hook still exists.

**Tech Stack:** Node.js, markdown docs, git, npm test

---

### Task 1: Flip Targeted Expectations

**Files:**
- Modify: `tests/install-hooks-copy.test.cjs`
- Modify: `tests/codex-config.test.cjs`
- Modify: `tests/bug-1754-js-hook-guard.test.cjs`
- Modify: `tests/bug-1906-hook-relative-paths.test.cjs`
- Modify: `tests/bug-2698-crlf-install.test.cjs`

- [ ] **Step 1: Rewrite targeted tests to expect no update hook**
- [ ] **Step 2: Run targeted tests to verify they fail against current code**

### Task 2: Remove Runtime Files And Installer Wiring

**Files:**
- Delete: `hooks/gsd-check-update.js`
- Delete: `hooks/gsd-check-update-worker.js`
- Modify: `scripts/build-hooks.js`
- Modify: `bin/install.js`

- [ ] **Step 1: Remove hook files and build list entries**
- [ ] **Step 2: Remove installer registration, uninstall cleanup, and Codex hook generation**
- [ ] **Step 3: Run targeted installer/Codex tests**

### Task 3: Remove Dead Tests And Update Remaining Compatibility Checks

**Files:**
- Delete: `tests/managed-hooks.test.cjs`
- Delete: `tests/check-update-config-dir.test.cjs`
- Delete: `tests/semver-compare.test.cjs`
- Delete: `tests/bug-2136-sh-hook-version.test.cjs`
- Delete: `tests/orphaned-hooks.test.cjs`
- Modify: `tests/core.test.cjs`

- [ ] **Step 1: Delete update-hook-only tests**
- [ ] **Step 2: Update remaining broad tests to stop referencing deleted files**
- [ ] **Step 3: Run targeted hook/core tests**

### Task 4: Clean Docs And Operational References

**Files:**
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/INVENTORY.md`
- Modify: `docs/INVENTORY-MANIFEST.json`
- Modify: `docs/manual-update.md`
- Modify: `get-shit-done/workflows/update.md`
- Modify: `.github/get-shit-done/workflows/update.md`

- [ ] **Step 1: Remove update-hook docs and inventory entries**
- [ ] **Step 2: Remove update workflow instructions that assume the hook still exists**
- [ ] **Step 3: Search for leftover tracked references and clear the remaining dead ones**

### Task 5: Verify

**Files:**
- Modify: `docs/superpowers/specs/2026-04-26-remove-update-check-hook-design.md`

- [ ] **Step 1: Run `git diff --check`**
- [ ] **Step 2: Run targeted tests for touched areas**
- [ ] **Step 3: Run `npm test`**
- [ ] **Step 4: Summarize final behavior and any compatibility residue that remains intentionally**
