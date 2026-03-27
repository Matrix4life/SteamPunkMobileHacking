import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.steambreach.game',
  appName: 'STEAMBREACH',
  webDir: 'dist',
  
  // Dark status bar to match game theme
  ios: {
    backgroundColor: '#0a0a0a',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'STEAMBREACH',
  },
  
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: true,
  },
  
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
    },
    Keyboard: {
      // Resize the web view when keyboard opens (critical for terminal input)
      resize: 'body',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
  },
  
  // === DEVELOPMENT ONLY ===
  // Uncomment for live reload during dev (use your machine's local IP):
  // server: {
  //   url: 'http://192.168.1.XXX:5173',
  //   cleartext: true,
  // },
};

export default config;
