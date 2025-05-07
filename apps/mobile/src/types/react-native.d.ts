import 'react-native';
import React from 'react';

declare module 'react-native' {
  // This fixes the type error by declaring that all React Native components are valid JSX elements
  interface ViewProps {
    children?: React.ReactNode;
  }

  interface TextProps {
    children?: React.ReactNode;
  }

  interface ImageProps {
    children?: React.ReactNode;
  }

  interface TouchableOpacityProps {
    children?: React.ReactNode;
  }

  interface ScrollViewProps {
    children?: React.ReactNode;
  }

  interface ActivityIndicatorProps {
    children?: React.ReactNode;
  }
  
  // Extend other component props as needed
} 