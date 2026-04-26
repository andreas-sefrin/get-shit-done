/**
 * Regression guard for #1767: gsd-workflow-guard.js must be registered in settings.json
 *
 * The hook file is built, copied, and installed — but was never registered as a
 * PreToolUse hook entry in install.js. This test ensures the registration block
 * exists with the correct structure.
 *
 * Also tests the broader anti-pattern: every hook in gsdHooks that is a JS
 * PreToolUse/PostToolUse hook should have a corresponding registration block.
 */
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const INSTALL_JS = path.join(__dirname, '..', 'bin', 'install.js');
const BUILD_HOOKS = path.join(__dirname, '..', 'scripts', 'build-hooks.js');

describe('workflow-guard hook registration (#1767)', () => {
  test('install.js constructs a command path variable for gsd-workflow-guard.js', () => {
    const content = fs.readFileSync(INSTALL_JS, 'utf-8');
    const lines = content.split('\n');
    // Every registered JS hook has a command variable constructed via
    // buildHookCommand() or string concatenation. Filter out references
    // that are only in the cleanup/uninstall arrays.
    const commandConstructionLines = lines.filter(line =>
      line.includes('gsd-workflow-guard.js') &&
      (line.includes('buildHookCommand') || line.includes("'node '"))
    );
    assert.ok(
      commandConstructionLines.length > 0,
      [
        'install.js must construct a command path for gsd-workflow-guard.js',
        '(e.g. buildHookCommand or node + dirName pattern).',
        'Currently only referenced in gsdHooks cleanup array.',
      ].join(' ')
    );
  });

  test('install.js has a hasWorkflowGuardHook dedup check', () => {
    const content = fs.readFileSync(INSTALL_JS, 'utf-8');
    // Every registered hook has a dedup check: hasXxxHook = settings.hooks[...].some(...)
    const hasDedup = content.includes('hasWorkflowGuardHook') ||
      content.includes('hasWorkflowGuard');
    assert.ok(
      hasDedup,
      'install.js must have a dedup check variable for workflow-guard (like hasPromptGuardHook)'
    );
  });

  test('install.js pushes workflow-guard entry with correct matcher', () => {
    const content = fs.readFileSync(INSTALL_JS, 'utf-8');
    // Extract the section between "workflow-guard" command construction
    // and the next console.log confirmation. The push block should have:
    // matcher: 'Write|Edit' and command referencing workflow-guard
    const workflowGuardSection = content.match(
      /workflowGuardCommand[\s\S]*?console\.log\([^)]*workflow.guard/i
    );
    assert.ok(
      workflowGuardSection,
      'install.js must have a push block for workflow-guard with a console.log confirmation'
    );
  });
});

describe('hook registration completeness anti-pattern guard', () => {
  test('every shipped JS hook has a command construction in install.js', () => {
    const content = fs.readFileSync(INSTALL_JS, 'utf-8');
    const buildHooks = fs.readFileSync(BUILD_HOOKS, 'utf-8');
    const hooksMatch = buildHooks.match(/HOOKS_TO_COPY\s*=\s*\[([\s\S]*?)\]/);
    assert.ok(hooksMatch, 'HOOKS_TO_COPY array must exist in build-hooks.js');

    const hookNames = hooksMatch[1]
      .match(/'([^']+)'/g)
      .map(h => h.replace(/'/g, ''));

    const jsHooks = hookNames.filter(h => h.endsWith('.js'));

    const missing = [];
    for (const hook of jsHooks) {
      // Each JS hook should have a buildHookCommand or 'node ' command construction
      // that references the hook filename (not just the gsdHooks array or uninstall filter)
      const hookBase = hook.replace('.js', '');
      const lines = content.split('\n').filter(line =>
        line.includes(hook) &&
        (line.includes('buildHookCommand') || line.includes("'node '"))
      );
      if (lines.length === 0) {
        missing.push(hook);
      }
    }

    assert.strictEqual(
      missing.length, 0,
      [
        'Every shipped JS hook must have a command construction in install.js.',
        'Missing registration for:',
        ...missing.map(h => `  - ${h}`),
      ].join('\n')
    );
  });
});
