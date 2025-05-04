import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { theme as themeConfig } from '../styles/theme';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
  colors: typeof themeConfig.navigation.colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(colorScheme === 'dark');

  // Load saved theme on initial load
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme from storage:', error);
      }
    };

    loadSavedTheme();
  }, []);

  // Update dark mode state when theme or system preference changes
  useEffect(() => {
    if (theme === 'system') {
      setIsDarkMode(colorScheme === 'dark');
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme, colorScheme]);

  // Save theme preference
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await SecureStore.setItemAsync('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        setTheme,
        colors: themeConfig.navigation.colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 