'use client';

import { ReactNode } from 'react';
import ThemeProvider from './ThemeProvider';
import ThemePicker from './ThemePicker';

export default function ThemeProviderWrap({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemePicker />
    </ThemeProvider>
  );
}
