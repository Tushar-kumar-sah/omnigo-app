import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { darkTheme, lightTheme, AppTheme, ThemeMode } from '@/constants/theme';

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

const THEME_STORAGE_KEY = 'omnigo_user_theme_mode';
const THEME_FILE_PATH = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${THEME_STORAGE_KEY}.txt` : null;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [hydrated, setHydrated] = useState(false);

  // Restore saved theme preference on start
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
          if (mounted && saved && (saved === 'dark' || saved === 'light' || saved === 'system')) {
            setModeState(saved);
          }
        } else if (THEME_FILE_PATH) {
          const info = await FileSystem.getInfoAsync(THEME_FILE_PATH);
          if (info.exists) {
            const saved = (await FileSystem.readAsStringAsync(THEME_FILE_PATH)).trim() as ThemeMode;
            if (mounted && (saved === 'dark' || saved === 'light' || saved === 'system')) {
              setModeState(saved);
            }
          }
        }
      } catch (err) {
        console.warn('[ThemeContext] Failed to load theme mode:', err);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      } else if (THEME_FILE_PATH) {
        await FileSystem.writeAsStringAsync(THEME_FILE_PATH, newMode);
      }
    } catch (err) {
      console.warn('[ThemeContext] Failed to save theme mode:', err);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    await setMode(nextMode);
  }, [mode, setMode]);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const activeTheme = isDark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      mode,
      isDark,
      theme: activeTheme,
      colors: activeTheme.colors,
      setMode,
      toggleTheme,
    }),
    [mode, isDark, activeTheme, setMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
