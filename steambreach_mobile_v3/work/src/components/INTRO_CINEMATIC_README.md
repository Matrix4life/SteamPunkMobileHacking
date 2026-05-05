# Intro Cinematic — Integration Guide

Two files dropped into `src/components/`:

- `IntroCinematic.jsx` — the full 22-second cold-open as a single React component
- `introAudio.js` — procedural WebAudio SFX module (boot beeps, whooshes, breach crackle, wordmark thud, ambient hum)

Both are self-contained — no additional dependencies beyond React.

## Wire it into HEXOVERRIDE.jsx

**1. Import at the top:**

```jsx
import IntroCinematic from './components/IntroCinematic';
```

**2. Change the initial screen state.** Find this line near the top of the `HEXOVERRIDE` component (around line 95):

```jsx
const [screen, setScreen] = useState('intro');
```

Replace with:

```jsx
const [screen, setScreen] = useState(
  localStorage.getItem('hexoverride_intro_seen') ? 'intro' : 'cinematic'
);
```

**3. Render the cinematic.** Just *before* the existing `if (screen === 'intro') { ... }` block (around line 5456), add:

```jsx
if (screen === 'cinematic') {
  return (
    <IntroCinematic
      portrait={isMobile}
      onComplete={() => {
        localStorage.setItem('hexoverride_intro_seen', '1');
        setScreen('intro');
      }}
    />
  );
}
```

That's it. First launch plays the cinematic, subsequent launches skip straight to the menu.

## Behavior

- Plays once, then calls `onComplete` and the menu takes over.
- Tap / click / any key skips it.
- `portrait` prop swaps layout: `true` for 9:16 (mobile), `false` for 16:9 (desktop). Wired to your existing `isMobile` hook above.
- Audio is **off by default** (browser autoplay policies require a user gesture). A small `♪ AUDIO OFF` button in the top-right enables it; tapping skips the cinematic, so users can see-then-hear on the second run if they want.
- localStorage key `hexoverride_intro_seen` blocks replay. Delete that key to force-replay during dev.

## Replay it from the menu (optional)

If you want a "rewatch intro" option in the OPTIONS submenu, add a menu item:

```jsx
{ id:'replayintro', label:'REPLAY INTRO', sub:'Watch the cold open again',
  color:C_I.pri, icon:'▶', onClick:()=>{ playBlip(); setScreen('cinematic'); } },
```

When `onComplete` fires, it'll go right back to the menu since the storage key is already set.

## Force-replay during dev

In the browser console:

```js
localStorage.removeItem('hexoverride_intro_seen');
location.reload();
```

## Customization

- **Skip the audio entirely:** pass `audio={false}` to the component — the audio button disappears and no WebAudio context is ever created.
- **Tighten or extend timing:** edit the `BOOT_LINES` / `BREACH_LINES` arrays and the per-scene `start`/`end` numbers at the top of `IntroCinematic.jsx`. Total `DURATION` constant is at the top.
- **Different SFX:** the `CUES` array in `introAudio.js` is keyed by absolute time — add/remove/retune cues there.
