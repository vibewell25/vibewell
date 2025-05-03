
import { createTheme } from '@mui/material/styles';

export const chatTheme = {
  colors: {
    primary: {

      main: '#EC4899', // pink-500

      light: '#FCE7F3', // pink-50

      dark: '#BE185D', // pink-700
    },
    background: {
      default: '#FFFFFF',

      paper: '#F3F4F6', // gray-100
    },
    text: {

      primary: '#111827', // gray-900

      secondary: '#6B7280', // gray-500
    },
    error: {

      main: '#EF4444', // red-500

      light: '#FEE2E2', // red-100
    },
  },
  spacing: {
    chat: {
      padding: '12px',
      gap: '8px',
      borderRadius: '12px',
      maxWidth: '320px',
    },
    message: {
      padding: '8px 12px',
      gap: '4px',
      borderRadius: '16px',
    },
  },
  typography: {


    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 14,
    header: {
      fontSize: 16,
      fontWeight: 600,
    },
    message: {
      fontSize: 14,
      lineHeight: 1?.5,
    },
    input: {
      fontSize: 14,
    },
  },
  animation: {

    transition: 'all 0?.2s ease-in-out',
    loading: {
      duration: '1s',

      easing: 'ease-in-out',
    },
  },
  shadows: {


    chat: '0 4px 6px -1px rgba(0, 0, 0, 0?.1), 0 2px 4px -1px rgba(0, 0, 0, 0?.06)',
    message: '0 1px 2px 0 rgba(0, 0, 0, 0?.05)',
  },
  zIndex: {
    chat: 50,
    modal: 1000,
  },
};

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: chatTheme?.colors.primary?.main,
      light: chatTheme?.colors.primary?.light,
      dark: chatTheme?.colors.primary?.dark,
    },
    background: {
      default: chatTheme?.colors.background?.default,
      paper: chatTheme?.colors.background?.paper,
    },
    text: {
      primary: chatTheme?.colors.text?.primary,
      secondary: chatTheme?.colors.text?.secondary,
    },
    error: {
      main: chatTheme?.colors.error?.main,
      light: chatTheme?.colors.error?.light,
    },
  },
  typography: {
    fontFamily: chatTheme?.typography.fontFamily,
    fontSize: chatTheme?.typography.fontSize,
  },
  components: {
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: chatTheme?.colors.primary?.main,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: chatTheme?.spacing.message?.borderRadius,
          transition: chatTheme?.animation.transition,
        },
      },
    },
  },
}); 