import { DefaultTheme } from '@react-navigation/native';

export const theme = {
  colors: {
    primary: '#6200EE',
    primaryDark: '#3700B3',
    secondary: '#03DAC6',
    secondaryDark: '#018786',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#B00020',
    text: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    disabled: '#CCCCCC',
    placeholder: '#888888',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    card: '#FFFFFF',
    border: '#E0E0E0',
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    body1: {
      fontSize: 16,
    },
    body2: {
      fontSize: 14,
    },
    button: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 12,
    },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    pill: 50,
  },
  // Navigation theme that matches our custom theme
  navigation: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#6200EE',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      border: '#E0E0E0',
      notification: '#FF3B30',
    },
  },
}; 