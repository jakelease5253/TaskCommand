// Theme configurations for TaskCommand

export const themes = {
  pittsburgh: {
    id: 'pittsburgh',
    name: 'Pittsburgh',
    colors: {
      // Primary colors
      primary: '#ffcc00',        // Yellow/Gold
      primaryDark: '#030303',    // Black
      primaryLight: '#fff9e6',   // Light yellow tint

      // Backgrounds
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',

      // Text
      text: '#030303',
      textSecondary: '#64748b',
      textLight: '#94a3b8',

      // Borders
      border: '#d1d5db',
      borderLight: '#e5e7eb',

      // Interactive states
      hover: 'rgba(255, 204, 0, 0.9)',
      active: '#e6b800',
      disabled: '#94a3b8',

      // Status colors
      success: '#86efac',
      error: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',

      // Shadows
      shadow: 'rgba(0, 0, 0, 0.08)',
      shadowStrong: 'rgba(0, 0, 0, 0.15)',
      shadowDark: 'rgba(0, 0, 0, 0.3)',
    },
    typography: {
      fontFamily: 'Poppins',
      sizes: {
        xs: '12px',
        sm: '13px',
        base: '14px',
        md: '15px',
        lg: '18px',
        xl: '24px',
      },
      weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      }
    }
  },

  fieldworks: {
    id: 'fieldworks',
    name: 'FieldWorks',
    colors: {
      // Primary colors
      primary: '#90a4ae',        // Light blue-gray
      primaryDark: '#2e7d32',    // Deep green
      primaryLight: '#e8f5e9',   // Light green tint

      // Backgrounds
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',

      // Text
      text: '#90a4ae',
      textSecondary: '#64748b',
      textLight: '#94a3b8',

      // Borders
      border: '#d1d5db',
      borderLight: '#e5e7eb',

      // Interactive states
      hover: 'rgba(46, 125, 50, 0.9)',
      active: '#1b5e20',
      disabled: '#94a3b8',

      // Status colors
      success: '#86efac',
      error: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',

      // Shadows
      shadow: 'rgba(0, 0, 0, 0.08)',
      shadowStrong: 'rgba(0, 0, 0, 0.15)',
      shadowDark: 'rgba(0, 0, 0, 0.3)',
    },
    typography: {
      fontFamily: 'Poppins',
      sizes: {
        xs: '12px',
        sm: '13px',
        base: '14px',
        md: '15px',
        lg: '18px',
        xl: '24px',
      },
      weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      }
    }
  },

  dallas: {
    id: 'dallas',
    name: 'Dallas',
    colors: {
      // Primary colors
      primary: '#c0c0c0',        // Silver
      primaryDark: '#002f6c',    // Navy blue
      primaryLight: '#e8f1f5',   // Light blue tint

      // Backgrounds
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',

      // Text
      text: '#002f6c',
      textSecondary: '#64748b',
      textLight: '#94a3b8',

      // Borders
      border: '#d1d5db',
      borderLight: '#e5e7eb',

      // Interactive states
      hover: 'rgba(192, 192, 192, 0.9)',
      active: '#a8a8a8',
      disabled: '#94a3b8',

      // Status colors
      success: '#86efac',
      error: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',

      // Shadows
      shadow: 'rgba(0, 0, 0, 0.08)',
      shadowStrong: 'rgba(0, 0, 0, 0.15)',
      shadowDark: 'rgba(0, 0, 0, 0.3)',
    },
    typography: {
      fontFamily: 'Poppins',
      sizes: {
        xs: '12px',
        sm: '13px',
        base: '14px',
        md: '15px',
        lg: '18px',
        xl: '24px',
      },
      weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      }
    }
  }
};

export const defaultTheme = themes.pittsburgh;

// Helper function to get theme by ID
export const getTheme = (themeId) => {
  return themes[themeId] || defaultTheme;
};
