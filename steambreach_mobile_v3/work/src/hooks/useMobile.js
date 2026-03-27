import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      // Detect virtual keyboard: viewport height shrinks significantly
      const heightRatio = window.visualViewport
        ? window.visualViewport.height / window.screen.height
        : 1;
      setIsKeyboardOpen(heightRatio < 0.75);
    };

    // Read CSS env() safe area values
    const root = document.documentElement;
    const computeSafeArea = () => {
      const style = getComputedStyle(root);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
      });
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    handleResize();
    computeSafeArea();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return { isMobile, isKeyboardOpen, safeArea };
}
