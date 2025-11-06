// TaskCommand Design System - Brand Colors
export const colors = {
  // Primary Brand Colors
  brandBlack: '#030303',
  brandYellow: '#ffcc00',

  // Background Colors
  backgroundLight: '#fafafa',
  backgroundCard: '#f2f2f2',

  // Text Colors
  textPrimary: '#030303',
  textSecondary: '#000000',
};

// Typography
export const typography = {
  fontFamily: 'Poppins',

  // Font Sizes
  sizes: {
    xs: '14px',
    sm: '18px',
    md: '24px',
    lg: '28px',
    xl: '30px',
    xxl: '32px',
    xxxl: '48px',
  },

  // Font Weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeights: {
    tight: '16px',
    normal: '31px',
    relaxed: '38px',
    loose: '40px',
    extraLoose: '42px',
    brand: '62px', // For brand wordmark
  },
};

// Spacing
export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  xxl: '32px',
  xxxl: '40px',
  huge: '48px',
  massive: '60px',
  gigantic: '70px',
  enormous: '80px',
};

// Shadows
export const shadows = {
  sm: '0px 2px 8px rgba(0,0,0,0.12)',
  md: '0px 0px 10px rgba(0,0,0,0.1)',
};

// Border Radius
export const borderRadius = {
  sm: '8px',
  md: '10px',
};

// Component Specific Styles
export const components = {
  card: {
    background: colors.backgroundCard,
    borderRadius: borderRadius.sm,
    boxShadow: shadows.sm,
  },

  button: {
    primary: {
      background: colors.brandYellow,
      color: colors.brandBlack,
      borderRadius: borderRadius.sm,
      boxShadow: shadows.md,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.medium,
      lineHeight: typography.lineHeights.normal,
    },
  },

  iconBox: {
    background: colors.brandBlack,
    color: colors.brandYellow,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm,
  },

  header: {
    height: '72px',
    background: '#ffffff',
    boxShadow: '0px 1px 12px rgba(193,193,193,0.25)',
  },
};

// Export default theme object
export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  components,
};
