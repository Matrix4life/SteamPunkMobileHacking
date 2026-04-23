[README-UPDATE.md](https://github.com/user-attachments/files/27021837/README-UPDATE.md)
# HexOverride Rebrand — Update Package

This zip contains ONLY the files that changed from the current `main` branch
of Matrix4life/SteamPunkMobileHacking as part of the STEAMBREACH → HexOverride
rename. Drop them into your repo, replacing the originals, then **delete** the
old `src/STEAMBREACH.jsx` (it's been renamed to `src/HEXOVERRIDE.jsx`).

## What changed

### File rename
- `src/STEAMBREACH.jsx` → `src/HEXOVERRIDE.jsx` (delete the old file after copying)

### In-game visible text
- **Intro / title screen**: `<h1>STEAMBREACH</h1>` → `<h1>HEXOVERRIDE</h1>`
- **Help menu header**: `[ STEAMBREACH OPERATOR MANUAL ]` → HEXOVERRIDE
- **Terminal command reference**: header + status banner
- **Sound Manager header**: large wordmark
- **Phase 1 Econ screen**: `HEXOVERRIDE // PHASE 1 ECON LOOP`
- **Operator readme.txt** (in-game file): `HEXOVERRIDE OPERATOR TERMINAL v3.0`

### Browser / platform
- Page `<title>` → HEXOVERRIDE
- PWA manifest name + short_name
- Capacitor appId (`com.steambreach.game` → `com.hexoverride.game`), appName, scheme
- Service-worker cache name: `steambreach-v1` → `hexoverride-v1`
- package.json name field

### Code identifiers
- Main component: `const STEAMBREACH = () => ...` → `const HEXOVERRIDE = ...`
- Default export updated
- App.jsx import updated to match new filename/component name

### localStorage / state keys
- `steambreach_ai_config` → `hexoverride_ai_config` (3 sites)
- `steambreach-phase1` → `hexoverride-phase1`
- history state flag: `{ steambreach: true }` → `{ hexoverride: true }`

### AI prompts
- Story director system prompt references HEXOVERRIDE
- File generator system prompt references HEXOVERRIDE

### NOT changed (intentional)
- **Save-data keys** (`breach_slot_*`, `breach_save_index`, `breach_api_key`):
  left alone so existing saves keep working. Changing these would orphan every
  player's saves.
- **Sound upload key** (`breach_sounds_v1`): same reason.
- **Gameplay terms** (`breached`, `WIRELESS BREACH`, `data breach`, etc.):
  these are in-game hacking terminology, not the brand name. Kept as-is.

## Actions to take

1. Copy every file in this zip into its matching path in your local checkout,
   overwriting the existing file.
2. **Delete** `steambreach_mobile_v3/work/src/STEAMBREACH.jsx` — it was
   renamed to `HEXOVERRIDE.jsx` (already included in this zip).
3. Optional: rename the top-level `steambreach_mobile_v3/` folder to
   `hexoverride_mobile_v3/` for consistency.
4. **Heads-up for existing players**: `hexoverride_ai_config` /
   `hexoverride-phase1` are new storage keys — existing AI settings and
   phase-1 state won't carry over. Add a one-time migration if you care.
5. Commit: `git add -A && git commit -m "Rename STEAMBREACH → HexOverride"`
