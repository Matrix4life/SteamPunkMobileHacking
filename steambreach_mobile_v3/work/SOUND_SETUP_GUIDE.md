# Sound & Music Setup Guide

## Overview
This guide explains how to add sound effects and background music to HEXOVERRIDE using Howler.js and Vercel static asset hosting.

---

## File Structure

```
steambreach_mobile_v3/work/
├── public/
│   ├── sounds/
│   │   ├── sfx/
│   │   │   ├── button-click.mp3
│   │   │   ├── command-execute.mp3
│   │   │   ├── breach-success.mp3
│   │   │   ├── error.mp3
│   │   │   └── terminal-beep.mp3
│   │   └── music/
│   │       └── ambient.mp3
│   └── (other existing assets)
├── src/
│   ├── audio/
│   │   └── SoundManager.js (NEW - singleton manager)
│   ├── HEXOVERRIDE.jsx (UPDATE - add sound integration)
│   └── (rest of your files)
├── package.json (UPDATED - added howler@^2.2.4)
└── vercel.json (NEW - Vercel build config)
```

---

## Step 1: Install Dependencies

The `package.json` has been updated with `howler: ^2.2.4`. Install it:

```bash
cd steambreach_mobile_v3/work
npm install
```

---

## Step 2: Add Audio Files

Upload MP3 files to `public/sounds/`:

### Sound Effects (sfx/)
- **button-click.mp3** - UI interactions
- **command-execute.mp3** - When player enters command
- **breach-success.mp3** - Successful hack/objective
- **error.mp3** - Failed action
- **terminal-beep.mp3** - Terminal system sounds

### Music (music/)
- **ambient.mp3** - Background loop (plays on game start)

**Recommended**: Use royalty-free sources:
- [Freesound.org](https://freesound.org) - 340M+ sounds
- [Zapsplat.com](https://www.zapsplat.com) - Free game audio
- [Incompetech.com](https://incompetech.com) - Music loops
- [Epidemic Sound](https://www.epidemicsound.com) - Professional (paid)

---

## Step 3: Update HEXOVERRIDE.jsx

Add this import at the top:

```jsx
import SoundManager from './audio/SoundManager';
```

### In your component, add this useEffect after other mount effects:

```jsx
useEffect(() => {
  // Load all sound effects
  SoundManager.loadSound('click', '/sounds/sfx/button-click.mp3');
  SoundManager.loadSound('execute', '/sounds/sfx/command-execute.mp3');
  SoundManager.loadSound('success', '/sounds/sfx/breach-success.mp3');
  SoundManager.loadSound('error', '/sounds/sfx/error.mp3');
  SoundManager.loadSound('beep', '/sounds/sfx/terminal-beep.mp3');

  // Load and play ambient music
  SoundManager.loadMusic('/sounds/music/ambient.mp3');
  SoundManager.playMusic();

  // Cleanup on unmount
  return () => {
    SoundManager.stopMusic();
  };
}, []);
```

### Trigger sounds at key moments:

```jsx
// When player submits a command
const handleCommand = (event) => {
  if (event.key === 'Enter') {
    SoundManager.play('execute');
    // ... rest of your command logic
  }
};

// On successful action
SoundManager.play('success');

// On error/failure
SoundManager.play('error');

// On UI click
<button onClick={() => { SoundManager.play('click'); /* ... */ }}>
  Click Me
</button>
```

---

## Step 4: Add Mute Toggle (Optional but Recommended)

Add a mute button to your UI:

```jsx
<button 
  onClick={() => SoundManager.toggleMute()}
  className="sound-toggle"
  title={SoundManager.getMuted() ? 'Unmute' : 'Mute'}
  style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
>
  {SoundManager.getMuted() ? '🔇 Muted' : '🔊 Sound On'}
</button>
```

The mute state persists via localStorage across sessions.

---

## Step 5: Deploy to Vercel

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: add sound effects and music with Howler.js"
   git push
   ```

2. Vercel auto-deploys from your main branch

3. Static assets in `public/sounds/` are automatically served via CDN

---

## SoundManager API Reference

```javascript
// Load a sound effect
SoundManager.loadSound('key', '/path/to/file.mp3');

// Load background music (auto-loops)
SoundManager.loadMusic('/path/to/music.mp3');

// Play a sound
SoundManager.play('key');

// Music control
SoundManager.playMusic();
SoundManager.pauseMusic();
SoundManager.resumeMusic();
SoundManager.stopMusic();

// Volume control (0.0 to 1.0)
SoundManager.setVolume(0.5);

// Mute toggle
SoundManager.toggleMute();

// Check mute state
if (SoundManager.getMuted()) { /* ... */ }
```

---

## Troubleshooting

### Sounds not playing on mobile?
- iOS requires user interaction before audio plays (browser policy)
- Add a "Start Game" button that calls `SoundManager.playMusic()` after user taps

### Volume too loud/quiet?
- Edit `SoundManager.js` lines 18 and 30:
  ```javascript
  volume: 0.6,  // sfx (change to 0.3-0.8)
  volume: 0.4,  // music (change to 0.3-0.8)
  ```

### Files not loading on Vercel?
- Ensure files are in `public/sounds/`
- Check browser DevTools Network tab for 404s
- Verify file paths match exactly (case-sensitive on Linux servers)

---

## Next Steps

1. ✅ Dependencies installed
2. ⏳ Add MP3 files to `public/sounds/`
3. ⏳ Integrate `SoundManager` into `HEXOVERRIDE.jsx`
4. ⏳ Push to GitHub → Vercel deploys
5. ⏳ Test on https://steam-punk-mobile-hacking.vercel.app