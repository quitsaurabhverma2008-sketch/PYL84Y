'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { COLOR_COMBOS, ColorCombo, getComboById, applyTheme } from '@/lib/themes';

interface ThemeContextType {
  combo: ColorCombo;
  setCombo: (combo: ColorCombo) => void;
  isPermanent: boolean;
  chatBg: string | null;
  setChatBg: (url: string | null) => void;
  showThemePicker: boolean;
  setShowThemePicker: (show: boolean) => void;
  showChatBgPicker: boolean;
  setShowChatBgPicker: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  combo: COLOR_COMBOS[0],
  setCombo: () => {},
  isPermanent: false,
  chatBg: null,
  setChatBg: () => {},
  showThemePicker: false,
  setShowThemePicker: () => {},
  showChatBgPicker: false,
  setShowChatBgPicker: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [combo, setComboState] = useState<ColorCombo>(COLOR_COMBOS[0]);
  const [isPermanent, setIsPermanent] = useState(false);
  const [chatBg, setChatBgState] = useState<string | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showChatBgPicker, setShowChatBgPicker] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('pyl84y_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsPermanent(!!user.isPermanent);
        if (user.prefs?.themeId) {
          const saved = getComboById(user.prefs.themeId);
          setComboState(saved);
          applyTheme(saved);
        }
        if (user.prefs?.chatBg) {
          setChatBgState(user.prefs.chatBg);
        }
      } catch {}
    }
  }, []);

  const setCombo = useCallback(async (newCombo: ColorCombo) => {
    setComboState(newCombo);
    applyTheme(newCombo);

    const storedUser = localStorage.getItem('pyl84y_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.prefs = { ...user.prefs, themeId: newCombo.id };
      localStorage.setItem('pyl84y_user', JSON.stringify(user));

      if (user.isPermanent) {
        try {
          await fetch('/api/user-preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              action: 'setTheme',
              themeId: newCombo.id,
            }),
          });
        } catch {}
      }
    }
  }, []);

  const setChatBg = useCallback(async (url: string | null) => {
    setChatBgState(url);

    const storedUser = localStorage.getItem('pyl84y_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.prefs = { ...user.prefs, chatBg: url };
      localStorage.setItem('pyl84y_user', JSON.stringify(user));

      if (user.isPermanent) {
        try {
          await fetch('/api/user-preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              action: 'setChatBg',
              chatBg: url,
            }),
          });
        } catch {}
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      combo, setCombo, isPermanent,
      chatBg, setChatBg,
      showThemePicker, setShowThemePicker,
      showChatBgPicker, setShowChatBgPicker,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
