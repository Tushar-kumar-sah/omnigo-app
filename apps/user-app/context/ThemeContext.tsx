import React, { createContext, useContext, useMemo } from 'react';
import { darkTheme, AppTheme, ThemeMode } from '@/constants/theme';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  theme: AppTheme;
  colors: AppTheme['colors'];
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  isDark: true,
  theme: darkTheme,
  colors: darkTheme.colors,
  setMode: async () => {},
  toggleTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(
    () => ({
      mode: 'dark' as ThemeMode,
      isDark: true,
      theme: darkTheme,
      colors: darkTheme.colors,
      setMode: async () => {},
      toggleTheme: async () => {},
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
