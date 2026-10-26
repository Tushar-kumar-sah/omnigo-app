export type ThemeMode = 'dark' | 'light' | 'system';

export const darkTheme = {
  isDark: true,
  colors: {
    background: '#050810',
    backgroundSecondary: '#0A0E17',
    gradient: ['#050810', '#0a1222', '#050810'] as [string, string, string],
    primary: '#00CFFF',
    secondary: '#00FF97',
    accent: '#0CF2FF',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.45)',
    danger: '#FF3B30',
    glassBg: 'rgba(13, 20, 32, 0.45)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
    cardBg: 'rgba(10, 28, 60, 0.65)',
    cardBorder: 'rgba(255, 255, 255, 0.35)',
    pillBg: 'rgba(255, 255, 255, 0.05)',
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999,
  },
};

export const lightTheme: typeof darkTheme = {
  isDark: false,
  colors: {
    background: '#F8FAFC',
    backgroundSecondary: '#FFFFFF',
    gradient: ['#F8FAFC', '#EEF2F6', '#F8FAFC'] as [string, string, string],
    primary: '#0095D9', // high daylight contrast
    secondary: '#10B981',
    accent: '#0284C7',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: 'rgba(15, 23, 42, 0.45)',
    danger: '#DC2626',
    glassBg: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(0, 149, 217, 0.2)',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    pillBg: 'rgba(15, 23, 42, 0.05)',
    divider: 'rgba(15, 23, 42, 0.06)',
  },
  spacing: darkTheme.spacing,
  borderRadius: darkTheme.borderRadius,
};

export type AppTheme = typeof darkTheme;

// Default export keeps existing screens 100% intact and backwards compatible
export const theme = darkTheme;

export const glassCardStyle = {
  backgroundColor: 'rgba(13, 20, 32, 0.45)',
  borderRadius: 20,
  borderWidth: 1.5,
  borderColor: 'rgba(255, 255, 255, 0.25)',
  shadowColor: '#00CFFF',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 8,
  overflow: 'hidden' as const,
};

export const glassStyle = glassCardStyle;
