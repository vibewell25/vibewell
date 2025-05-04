import 'react-native';
import type { ComponentType, Component } from 'react';

declare module 'react-native' {
  interface ViewStyle {
    flex?: number;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
    marginBottom?: number;
    elevation?: number;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    flexDirection?: 'row' | 'column';
    justifyContent?: 'space-between' | 'flex-start' | 'flex-end' | 'center';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch';
    position?: 'absolute' | 'relative';
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    margin?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dotted' | 'dashed';
    opacity?: number;
    zIndex?: number;
  }

  interface TextStyle extends ViewStyle {
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
    textDecorationColor?: string;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    letterSpacing?: number;
    lineHeight?: number;
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
    includeFontPadding?: boolean;
    textShadowColor?: string;
    textShadowOffset?: { width: number; height: number };
    textShadowRadius?: number;
  }

  interface ImageStyle extends ViewStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    tintColor?: string;
    overlayColor?: string;
  }

  interface TouchableOpacityProps {
    ref?: any;
    style?: ViewStyle | ViewStyle[];
    activeOpacity?: number;
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    onLongPress?: () => void;
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean;
      busy?: boolean;
      expanded?: boolean;
    };
  }

  interface ImageProps {
    ref?: any;
    source: { uri: string } | number;
    style?: ImageStyle | ImageStyle[];
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    onLoad?: () => void;
    onError?: (error: { nativeEvent: { error: string } }) => void;
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
  }

  interface ViewProps {
    ref?: any;
    style?: ViewStyle | ViewStyle[];
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean;
      busy?: boolean;
      expanded?: boolean;
    };
    onLayout?: (event: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }) => void;
  }
  
  interface TextProps {
    ref?: any;
    style?: TextStyle | TextStyle[];
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean;
      busy?: boolean;
      expanded?: boolean;
    };
    onPress?: () => void;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  }
  
  interface FlatListProps<ItemT> {
    ref?: any;
    data?: ItemT[];
    renderItem?: (info: { item: ItemT; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    contentContainerStyle?: ViewStyle | ViewStyle[];
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    onRefresh?: () => void;
    refreshing?: boolean;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean;
      busy?: boolean;
      expanded?: boolean;
    };
  }
  
  interface SafeAreaViewProps {
    ref?: any;
    style?: ViewStyle | ViewStyle[];
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean;
      busy?: boolean;
      expanded?: boolean;
    };
  }

  export class View extends Component<ViewProps> {
    refs: {
      [key: string]: any;
    };
  }
  
  export class Text extends Component<TextProps> {
    refs: {
      [key: string]: any;
    };
  }
  
  export class FlatList<ItemT = any> extends Component<FlatListProps<ItemT>> {
    refs: {
      [key: string]: any;
    };
  }
  
  export class SafeAreaView extends Component<SafeAreaViewProps> {
    refs: {
      [key: string]: any;
    };
  }

  export class TouchableOpacity extends Component<TouchableOpacityProps> {
    refs: {
      [key: string]: any;
    };
  }

  export class Image extends Component<ImageProps> {
    refs: {
      [key: string]: any;
    };
  }
} 