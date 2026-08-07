export const theme = {
  colors: {
    background: '#050810',
    primary: '#00CFFF',
    secondary: '#00FF97',
    accent: '#0CF2FF',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    danger: '#FF3B30',
    glassBg: 'rgba(13, 20, 32, 0.45)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
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
