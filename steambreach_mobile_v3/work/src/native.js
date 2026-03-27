/**
 * STEAMBREACH Native Bridge
 * Initializes Capacitor plugins for mobile. Safe to import on web — 
 * all calls are no-ops when running in browser.
 */

const isNative = () => {
  try {
    return window.Capacitor?.isNativePlatform?.() ?? false;
  } catch { return false; }
};

// --- STATUS BAR ---
export async function initStatusBar() {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0a' });
    // On iOS, overlay status bar so game fills full screen
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch (e) {
    console.warn('[native] StatusBar unavailable:', e.message);
  }
}

// --- KEYBOARD ---
export async function initKeyboard() {
  if (!isNative()) return;
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    // Don't auto-scroll the page when keyboard shows — we handle layout ourselves
    await Keyboard.setScroll({ isDisabled: true });
    // Keep input visible by resizing body
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
    const { Haptics } = await import('@capacitor/haptics');
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
    const { SplashScreen } = await import('@capacitor/splash-screen');
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
  // Hide splash after plugins init
  setTimeout(() => hideSplash(), 200);
}
