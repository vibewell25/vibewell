import 'expo-router';
import React from 'react';

declare module 'expo-router' {
  // Make Stack.Screen a valid JSX element
  namespace Stack {
    interface ScreenProps {
      children?: React.ReactNode;
      options?: any;
    }

    interface Screen {
      (props: ScreenProps): React.ReactElement | null;
    }
  }

  // Fix other Expo Router components as needed
  interface LinkProps {
    children?: React.ReactNode;
  }
} 