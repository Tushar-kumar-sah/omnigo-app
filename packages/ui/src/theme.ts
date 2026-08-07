/**
 * OmniGo Design System — Theme Tokens
 * Futuristic Dark Glassmorphic Theme
 */

export const colors = {
  // Backgrounds
  bgPrimary: '#0A0E17',
  bgSecondary: '#0D1420',
  bgTertiary: '#131B2E',
  bgInput: '#0F1624',

  // Glass
  glassBg: 'rgba(13, 20, 32, 0.65)',
  glassBgLight: 'rgba(13, 20, 32, 0.45)',
  glassBorder: 'rgba(0, 207, 255, 0.15)',
  glassBorderBright: 'rgba(0, 207, 255, 0.3)',

  // Accents
  accentCyan: '#00CFFF',
  accentGreen: '#00FF97',
  accentTeal: '#0CF2FF',
  accentBlue: '#0066FF',
  accentPurple: '#8B5CF6',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B9DC3',
  textMuted: '#4A5568',
  textCyan: '#00CFFF',
  textGreen: '#00FF97',

  // Status
  danger: '#FF3B3B',
  dangerBg: 'rgba(255, 59, 59, 0.15)',
  warning: '#FFB800',
  warningBg: 'rgba(255, 184, 0, 0.15)',
  success: '#00FF97',
  successBg: 'rgba(0, 255, 151, 0.15)',

  // Gradients
  gradientCyan: ['#00CFFF', '#0066FF'],
  gradientGreen: ['#00FF97', '#00CFFF'],
  gradientDark: ['#0A0E17', '#131B2E'],
  gradientGlass: ['rgba(0, 207, 255, 0.08)', 'rgba(0, 207, 255, 0.02)'],

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const shadows = {
  glowCyan: {
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glowGreen: {
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glowDanger: {
    shadowColor: '#FF3B3B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 12,
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const typography = {
  h1: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
  },
  h2: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#8B9DC3',
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#8B9DC3',
  },
  button: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  price: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    lineHeight: 30,
    color: '#00CFFF',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 16,
    color: '#8B9DC3',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
  },
};

export const glassStyle = {
  card: {
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden' as const,
  },
  cardBright: {
    backgroundColor: colors.glassBgLight,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorderBright,
    overflow: 'hidden' as const,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
};

export const theme = {
  colors,
  shadows,
  spacing,
  borderRadius,
  typography,
  glassStyle,
};

export type Theme = typeof theme;
export default theme;
