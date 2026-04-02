import React, { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@awesome-cordova-plugins/navigation-bar'; // Optional: for hiding bottom nav
import STEAMBREACH from './components/STEAMBREACH';
import { COLORS } from './constants/gameConstants';

const App = () => {
  useEffect(() => {
    // 1. Configure the Status Bar (The top bar with clock/battery)
    const setupStatusBar = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: COLORS.bg }); // Match your terminal bg
        await StatusBar.setStyle({ style: Style.Dark }); // Makes icons white/light
      } catch (e) {
        console.log("StatusBar not available on web");
      }
    };

    // 2. Handle Android Hardware Back Button
    const setupBackButton = () => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        // We trigger a custom event that STEAMBREACH.jsx can listen to
        const event = new CustomEvent('hardwareBack', { 
          detail: { canGoBack } 
        });
        window.dispatchEvent(event);
      });
    };

    setupStatusBar();
    setupBackButton();

    return () => {
      CapApp.removeAllListeners();
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: COLORS.bg,
      overflow: 'hidden',
      position: 'fixed' // Prevents "rubber-banding" scroll on mobile
    }}>
      <STEAMBREACH />
    </div>
  );
};

export default App;
