export type ThemeMode = 'dark' | 'light' | 'system';

export const DARK_THEME = {
  isDark: true,
  colors: {
    background: '#0A0E17',
    backgroundDeep: '#050810',
    gradient: ['#050810', '#0a1222', '#050810'] as [string, string, string],
    glassBg: 'rgba(13, 20, 32, 0.65)',
    glassBorder: 'rgba(0, 207, 255, 0.15)',
    primary: '#00CFFF', // Cyan
    secondary: '#0CF2FF', // Teal
    accent: '#0066FF', // Blue
    success: '#00FF97', // Green
    warning: '#FFB800', // Amber
    danger: '#FF3366',
    dangerRed: '#FF3B30',
    text: '#FFFFFF',
    textSecondary: '#8B9DC3',
    textMuted: 'rgba(255, 255, 255, 0.45)',
    cardBg: '#121A2A',
    surfaceDark: 'rgba(10, 14, 23, 0.85)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardAndroid: '#0d1428',
    divider: 'rgba(255, 255, 255, 0.06)',
    pillBg: 'rgba(255, 255, 255, 0.05)',
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fonts: {
    outfit: {
      regular: 'Outfit_400Regular',
      medium: 'Outfit_500Medium',
      bold: 'Outfit_700Bold',
    },
    inter: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      bold: 'Inter_700Bold',
    },
  },
};

export const LIGHT_THEME: typeof DARK_THEME = {
  isDark: false,
  colors: {
    background: '#F1F5F9', // Slate 100
    backgroundDeep: '#FFFFFF',
    gradient: ['#F1F5F9', '#FFFFFF', '#F1F5F9'] as [string, string, string],
    glassBg: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(0, 149, 217, 0.2)',
    primary: '#0095D9', // Deep vibrant Cyan/Blue for clear contrast in daylight
    secondary: '#059669', // Emerald
    accent: '#2563EB', // Blue
    success: '#10B981', // Green
    warning: '#D97706', // High-contrast Amber
    danger: '#EF4444',
    dangerRed: '#DC2626',
    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textMuted: 'rgba(15, 23, 42, 0.45)',
    cardBg: '#FFFFFF',
    surfaceDark: '#E2E8F0',
    overlay: 'rgba(15, 23, 42, 0.45)',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    cardAndroid: '#FFFFFF',
    divider: 'rgba(15, 23, 42, 0.06)',
    pillBg: 'rgba(15, 23, 42, 0.05)',
  },
  borderRadius: DARK_THEME.borderRadius,
  spacing: DARK_THEME.spacing,
  fonts: DARK_THEME.fonts,
};

export type AppTheme = typeof DARK_THEME;

// Default export maintains 100% backward compatibility for all existing dark mode screens
export const THEME = DARK_THEME;
