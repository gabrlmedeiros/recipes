import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors } from '../constants/theme';

const THEME_KEY = 'theme';

type Colors = typeof DarkColors;

type ThemeContextType = {
  isDark: boolean;
  colors: Colors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: DarkColors,
  toggleTheme: () => {},
});

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'light') setIsDark(false);
      else if (val === 'dark') setIsDark(true);
    });
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DarkColors : LightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
