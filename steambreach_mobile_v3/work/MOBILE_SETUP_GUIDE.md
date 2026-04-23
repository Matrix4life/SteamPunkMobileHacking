# HEXOVERRIDE Mobile Setup Guide (Capacitor)

## Overview

This converts your existing Vite+React game into a native iOS/Android app using Capacitor. Your desktop web version stays identical — mobile adaptations only activate on small screens.

---

## File Inventory

New files to add to `hexoverride_split/`:

```
index.html                          ← REPLACE (adds viewport, safe areas, iOS zoom fix)
capacitor.config.ts                 ← NEW (Capacitor project config)
setup-capacitor.sh                  ← NEW (one-shot install script)
src/hooks/useMobile.js              ← NEW (responsive detection hook)
src/components/MobileQuickBar.jsx   ← NEW (touch command bar)
src/components/Header.jsx           ← REPLACE (mobile-responsive version)
src/native.js                       ← NEW (Capacitor plugin bridge)
```

---

## Step 1: Copy Files

Copy all provided files into your `hexoverride_split/` directory, replacing `index.html` and `src/components/Header.jsx`.

---

## Step 2: Run Capacitor Setup

```bash
cd hexoverride_split
chmod +x setup-capacitor.sh
./setup-capacitor.sh
```

This installs Capacitor, adds iOS/Android platforms, and does the first build+sync.

**Prerequisites**: Node 18+, and for native builds:
- iOS: macOS + Xcode 15+
- Android: Android Studio + SDK 33+

---

## Step 3: Patch HEXOVERRIDE.jsx

These are the exact changes needed in `src/HEXOVERRIDE.jsx`. Apply them in order.

### 3A. Add imports (top of file)

Add these lines after the existing imports:

```jsx
import { useMobile } from './hooks/useMobile';
import MobileQuickBar from './components/MobileQuickBar';
import { initNative, hapticLight, hapticMedium, hapticSuccess, hapticError } from './native';
```

### 3B. Add mobile hook (inside the HEXOVERRIDE component, near top)

After the existing `useState` declarations (around line 85), add:

```jsx
const { isMobile, isKeyboardOpen } = useMobile();
```

### 3C. Initialize native plugins on mount

Find the first `useEffect` block (the one with `terminalEndRef.current`), and add a new effect right after it:

```jsx
// Initialize Capacitor native plugins
useEffect(() => {
  initNative();
}, []);
```

### 3D. Add mobile command handler

Add this function near the other handlers (e.g., near `handleCommand`):

```jsx
// For MobileQuickBar — execute a full command directly
const executeQuickCommand = useCallback((cmd) => {
  if (isProcessing) return;
  hapticLight();
  // Simulate typing + enter
  setInput(cmd);
  setTimeout(() => {
    const fakeEvent = { key: 'Enter', preventDefault: () => {} };
    handleCommand(fakeEvent);
  }, 50);
}, [isProcessing, handleCommand]);

// For MobileQuickBar — fill input with partial command
const fillPartialCommand = useCallback((partial) => {
  hapticLight();
  setInput(partial);
}, []);
```

### 3E. Pass `isMobile` to Header

Find the `<Header` component in the game screen JSX (around line 2577) and add the prop:

```jsx
<Header
  ... existing props ...
  isMobile={isMobile}
/>
```

### 3F. Make NetworkMap + RigDisplay stack on mobile

Find the line with the side-by-side layout (around line 2602):
```jsx
<div style={{ display: 'flex', gap: '8px', margin: '6px 0' }}>
```

Replace with:
```jsx
<div style={{ display: 'flex', gap: '8px', margin: '6px 0', flexDirection: isMobile ? 'column' : 'row' }}>
```

### 3G. Adjust terminal font size on mobile

Find the terminal output container (around line 2614):
```jsx
<div style={{ flexGrow: 1, overflowY: 'auto', margin: '4px 0', ...
```

Add `fontSize` to its style:
```jsx
<div style={{ flexGrow: 1, overflowY: 'auto', margin: '4px 0', paddingRight: '8px',
  fontSize: isMobile ? '11px' : 'inherit',
  scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` }}>
```

### 3H. Add MobileQuickBar before the input line

Find the input line container (the `<div onClick={...}` that contains the terminal input, around line 2628).

Add the MobileQuickBar **right before** it:

```jsx
{isMobile && (
  <MobileQuickBar
    isInside={isInside}
    privilege={privilege}
    isChatting={isChatting}
    targetIP={targetIP}
    botnet={botnet}
    onCommand={executeQuickCommand}
    onPartial={fillPartialCommand}
    inputRef={inputRef}
  />
)}
```

### 3I. Add haptic feedback to key moments (optional but recommended)

In your command processing logic, add haptics at satisfying moments:

```jsx
// After successful exploit:
hapticSuccess();

// After trace maxout or failed exploit:
hapticError();

// After pwnkit escalation:
hapticMedium();
```

Search for `playSuccess()` calls and add `hapticSuccess()` next to them. Same pattern for `playFailure()` → `hapticError()`.

### 3J. Adjust game container padding on mobile

Find the outermost game screen div (around line 2569):
```jsx
padding: '12px 16px'
```

Change to:
```jsx
padding: isMobile ? '8px 10px' : '12px 16px'
```

---

## Step 4: Build & Deploy

### Development (live reload)

```bash
# Start Vite dev server
npm run dev

# In capacitor.config.ts, uncomment the server block and set your IP:
# server: { url: 'http://YOUR_LOCAL_IP:5173', cleartext: true }

# Then:
npx cap sync
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

### Production build

```bash
npm run build
npx cap sync
npx cap open ios
# Build from Xcode → Archive → Distribute
```

---

## Step 5: App Store Prep

### iOS (App Store Connect)
1. `npx cap open ios`
2. In Xcode: Set bundle ID, version, team
3. Add app icons (1024x1024 source) to `ios/App/App/Assets.xcassets`
4. Product → Archive → Distribute App
5. In App Store Connect: screenshots, description, age rating (17+ for hacking themes)

### Android (Google Play)
1. `npx cap open android`
2. In Android Studio: Set applicationId, versionCode
3. Add adaptive icons to `android/app/src/main/res/`
4. Build → Generate Signed Bundle
5. Upload AAB to Google Play Console

### App Store Notes
- **Age Rating**: Mark as 17+ / PEGI 16 — hacking simulation content
- **Screenshots**: Grab from simulator, you need 6.7" (iPhone) and 12.9" (iPad)
- **Privacy**: No data collection if you keep everything in localStorage
- **Review Tip**: Emphasize "educational cybersecurity training" in description

---

## Architecture Summary

```
hexoverride_split/
├── dist/                    ← Vite build output (what Capacitor wraps)
├── ios/                     ← Xcode project (auto-generated by Capacitor)
├── android/                 ← Android Studio project (auto-generated)
├── capacitor.config.ts      ← Capacitor settings
├── index.html               ← Updated with mobile meta tags + safe areas
├── src/
│   ├── HEXOVERRIDE.jsx      ← Patched with mobile hooks + quick bar
│   ├── native.js            ← Capacitor plugin bridge
│   ├── hooks/
│   │   └── useMobile.js     ← Responsive detection
│   └── components/
│       ├── Header.jsx       ← Mobile-responsive (2-row compact layout)
│       ├── MobileQuickBar.jsx ← Touch command buttons
│       └── ... (existing components unchanged)
```

**How it works**: Your game remains a standard Vite+React web app. Capacitor wraps the `dist/` build output in a native WebView. The `useMobile` hook detects small screens and activates responsive layouts. The native bridge (`native.js`) provides haptics, status bar control, and keyboard management when running inside the Capacitor shell — and silently no-ops on regular web.

---

## Workflow After Setup

```bash
# Daily development cycle:
npm run dev                    # Web dev as usual at localhost:5173

# Test on device:
npm run build && npx cap sync  # Build + push to native projects
npx cap open ios               # Run in Xcode simulator
npx cap open android           # Run in Android emulator

# After adding new Capacitor plugins:
npx cap sync                   # Syncs web assets + native plugins
```
