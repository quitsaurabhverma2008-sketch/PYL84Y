'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  touchSupported: boolean;
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPortrait: false,
    screenWidth: 1024,
    screenHeight: 768,
    touchSupported: false,
  });

  useEffect(() => {
    const detect = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const touch = 'ontouchstart' in navigator || navigator.maxTouchPoints > 0;
      const isPortrait = h > w;

      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;

      if (w < 640) {
        isMobile = true;
        isDesktop = false;
      } else if (w < 1024 && touch) {
        isTablet = true;
        isDesktop = false;
      }

      setInfo({
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        screenWidth: w,
        screenHeight: h,
        touchSupported: touch,
      });
    };

    detect();
    window.addEventListener('resize', detect);
    window.addEventListener('orientationchange', () => setTimeout(detect, 100));
    return () => {
      window.removeEventListener('resize', detect);
    };
  }, []);

  return info;
}
