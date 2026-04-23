#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# HEXOVERRIDE → Capacitor Mobile Setup
# Run from: hexoverride_split/
# ═══════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════"
echo " HEXOVERRIDE MOBILE — Capacitor Setup"
echo "═══════════════════════════════════════════════"
echo ""

# 1. Install Capacitor core
echo "[1/5] Installing Capacitor..."
npm install @capacitor/core @capacitor/cli

# 2. Initialize Capacitor (creates capacitor.config.ts)
echo "[2/5] Initializing Capacitor project..."
npx cap init "HEXOVERRIDE" "com.hexoverride.game" --web-dir dist

# 3. Add platforms
echo "[3/5] Adding iOS and Android platforms..."
npm install @capacitor/ios @capacitor/android

# Optional native plugins for game feel
echo "[4/5] Installing native plugins..."
npm install @capacitor/haptics @capacitor/status-bar @capacitor/keyboard @capacitor/splash-screen

# 4. Build the web app first
echo "[5/5] Building web bundle..."
npm run build

# 5. Add platforms and sync
echo ""
echo "Adding platforms..."
npx cap add ios
npx cap add android
npx cap sync

echo ""
echo "═══════════════════════════════════════════════"
echo " SETUP COMPLETE"
echo "═══════════════════════════════════════════════"
echo ""
echo " To run on iOS:  npx cap open ios"
echo " To run on Android:  npx cap open android"
echo ""
echo " After code changes:"
echo "   npm run build && npx cap sync"
echo ""
echo " For live reload during development:"
echo "   Add server.url to capacitor.config.ts"
echo "   (see MOBILE_SETUP_GUIDE.md)"
echo "═══════════════════════════════════════════════"
