import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTheme, defaultTheme } from '../constants/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage or use default
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    const saved = localStorage.getItem('taskcommand-theme');
    return saved || 'pittsburgh';
  });

  const theme = getTheme(currentThemeId);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('taskcommand-theme', currentThemeId);
  }, [currentThemeId]);

  // Apply theme colors as CSS variables
  useEffect(() => {
    if (theme && theme.colors) {
      const root = document.documentElement;

      // Apply all color variables
      Object.entries(theme.colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variables
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--theme-${cssVarName}`, value);
        console.log(`Setting CSS variable: --theme-${cssVarName} = ${value}`);
      });

      // Apply typography variables
      if (theme.typography) {
        root.style.setProperty('--theme-font-family', theme.typography.fontFamily);
      }

      console.log('Theme applied:', theme.id);
    }
  }, [theme]);

  const setTheme = (themeId) => {
    setCurrentThemeId(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentThemeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
