/**
 * STEAMBREACH Native Bridge
 * All functions are no-ops on web. Capacitor plugins only load
 * when running inside a native shell (iOS/Android).
 * 
 * Uses @vite-ignore dynamic imports so Rollup won't try to
 * resolve @capacitor/* packages at build time.
 */

const isNative = () => {
  try {
    return window.Capacitor?.isNativePlatform?.() ?? false;
  } catch { return false; }
};

// Trick Vite: @vite-ignore prevents Rollup from resolving these
const cap = (pkg) => import(/* @vite-ignore */ `@capacitor/${pkg}`);

// --- STATUS BAR ---
export async function initStatusBar() {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await cap('status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0a' });
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch (e) {
    console.warn('[native] StatusBar unavailable:', e.message);
  }
}

// --- KEYBOARD ---
export async function initKeyboard() {
  if (!isNative()) return;
  try {
    const { Keyboard } = await cap('keyboard');
    await Keyboard.setScroll({ isDisabled: true });
    await Keyboard.setResizeMode({ mode: 'body' });
  } catch (e) {
    console.warn('[native] Keyboard unavailable:', e.message);
  }
}

// --- HAPTICS ---
let HapticsModule = null;

async function getHaptics() {
  if (!isNative()) return null;
  if (HapticsModule) return HapticsModule;
  try {
    const { Haptics } = await cap('haptics');
    HapticsModule = Haptics;
    return Haptics;
  } catch { return null; }
}

export async function hapticLight() {
  const h = await getHaptics();
  h?.impact?.({ style: 'LIGHT' });
}

export async function hapticMedium() {
  const h = await getHaptics();
  h?.impact?.({ style: 'MEDIUM' });
}

export async function hapticHeavy() {
  const h = await getHaptics();
  h?.impact?.({ style: 'HEAVY' });
}

export async function hapticError() {
  const h = await getHaptics();
  h?.notification?.({ type: 'ERROR' });
}

export async function hapticSuccess() {
  const h = await getHaptics();
  h?.notification?.({ type: 'SUCCESS' });
}

// --- SPLASH SCREEN ---
export async function hideSplash() {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await cap('splash-screen');
    await SplashScreen.hide();
  } catch (e) {
    console.warn('[native] SplashScreen unavailable:', e.message);
  }
}

// --- INIT ALL ---
export async function initNative() {
  if (!isNative()) return;
  await Promise.all([
    initStatusBar(),
    initKeyboard(),
  ]);
  setTimeout(() => hideSplash(), 200);
}
