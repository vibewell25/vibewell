
    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { DefaultTheme } from '@react-navigation/native';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    primary: '#2A9D8F',
    secondary: '#8A5CF5',
    beautyPrimary: '#FF7D6B',
    beautySecondary: '#FFB6A6',
    wellnessPrimary: '#8E7DF1',
    wellnessSecondary: '#C4C1F8',
    white: '#FFFFFF',
    offWhite: '#F8F9FA',
    lightGrey: '#E9ECEF',
    grey: '#ADB5BD',
    darkGrey: '#495057',
    black: '#212529',
    success: '#2BB673',
    error: '#E54D4D',
    warning: '#FFC857',
    info: '#4ECDC4',
    gradientStart: '#2A9D8F',
    gradientEnd: '#8A5CF5',
  },
  typography: {
    fontFamily: {
      primary: 'Montserrat',
      secondary: 'Libre Baskerville',

    // Safe integer operation
    if (Montserrat > Number.MAX_SAFE_INTEGER || Montserrat < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      light: 'Montserrat-Light',

    // Safe integer operation
    if (Montserrat > Number.MAX_SAFE_INTEGER || Montserrat < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      regular: 'Montserrat-Regular',

    // Safe integer operation
    if (Montserrat > Number.MAX_SAFE_INTEGER || Montserrat < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      medium: 'Montserrat-Medium',

    // Safe integer operation
    if (Montserrat > Number.MAX_SAFE_INTEGER || Montserrat < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      semiBold: 'Montserrat-SemiBold',

    // Safe integer operation
    if (Montserrat > Number.MAX_SAFE_INTEGER || Montserrat < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      bold: 'Montserrat-Bold',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
      xxxl: 44,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    light: {
      shadowColor: '#212529',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#212529',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    dark: {
      shadowColor: '#212529',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  metrics: {
    screenWidth: width,
    screenHeight: height,
    headerHeight: 60,
    bottomTabHeight: 60,
  },
  animation: {
    veryFast: 150,
    fast: 300,
    medium: 500,
    slow: 700,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },
  navigation: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#2A9D8F',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#212529',
      border: '#E9ECEF',
      notification: '#FF7D6B',
    },
  },
};

export type AppTheme = typeof theme;