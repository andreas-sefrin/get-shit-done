# Workstream Flag (`--ws`)

## Overview

The `--ws <name>` flag scopes GSD operations to a specific workstream, enabling
parallel milestone work by multiple Claude Code instances on the same codebase.

## Resolution Priority

1. `--ws <name>` flag (explicit, highest priority)
2. `GSD_WORKSTREAM` environment variable (per-instance)
3. Session-scoped active workstream pointer in temp storage (per runtime session / terminal)
4. `.planning/active-workstream` file (legacy shared fallback when no session key exists)
5. `null` — flat mode (no workstreams)

## Why session-scoped pointers exist

The shared `.planning/active-workstream` file is fundamentally unsafe when multiple
Claude/Codex instances are active on the same repo at the same time. One session can
silently repoint another session's `STATE.md`, `ROADMAP.md`, and phase paths.

GSD now prefers a session-scoped pointer keyed by runtime/session identity
(`GSD_SESSION_KEY`, `CODEX_THREAD_ID`, `CLAUDE_CODE_SSE_PORT`, terminal session IDs,
or the controlling TTY). This keeps concurrent sessions isolated while preserving
legacy compatibility for runtimes that do not expose a stable session key.

## Routing Propagation

All workflow routing commands include `${GSD_WS}` which:
- Expands to `--ws <name>` when a workstream is active
- Expands to empty string in flat mode (backward compatible)

This ensures workstream scope chains automatically through the workflow:
`new-milestone → discuss-phase → plan-phase → execute-phase → transition`

## Directory Structure

```
.planning/
├── PROJECT.md          # Shared
├── config.json         # Shared
├── milestones/         # Shared
├── codebase/           # Shared
├── active-workstream   # Legacy shared fallback only
└── workstreams/
    ├── feature-a/      # Workstream A
    │   ├── STATE.md
    │   ├── ROADMAP.md
    │   ├── REQUIREMENTS.md
    │   └── phases/
    └── feature-b/      # Workstream B
        ├── STATE.md
        ├── ROADMAP.md
        ├── REQUIREMENTS.md
        └── phases/
```

## CLI Usage

```bash
# All gsd-tools commands accept --ws
node gsd-tools.cjs state json --ws feature-a
node gsd-tools.cjs find-phase 3 --ws feature-b

# Session-local switching without --ws on every command
GSD_SESSION_KEY=my-terminal-a node gsd-tools.cjs workstream set feature-a
GSD_SESSION_KEY=my-terminal-a node gsd-tools.cjs state json
GSD_SESSION_KEY=my-terminal-b node gsd-tools.cjs workstream set feature-b
GSD_SESSION_KEY=my-terminal-b node gsd-tools.cjs state json

# Workstream CRUD
node gsd-tools.cjs workstream create <name>
node gsd-tools.cjs workstream list
node gsd-tools.cjs workstream status <name>
node gsd-tools.cjs workstream complete <name>
```
