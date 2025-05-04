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
  }

  interface TextStyle {
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
    marginHorizontal?: number;
    marginTop?: number;
    marginBottom?: number;
  }

  interface ViewProps {
    ref?: any;
    style?: ViewStyle | ViewStyle[];
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
  }
  
  interface TextProps {
    ref?: any;
    style?: TextStyle | TextStyle[];
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
  }
  
  interface FlatListProps<ItemT> {
    ref?: any;
    data?: ItemT[];
    renderItem?: (info: { item: ItemT; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    contentContainerStyle?: ViewStyle | ViewStyle[];
    showsVerticalScrollIndicator?: boolean;
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
  }
  
  interface SafeAreaViewProps {
    ref?: any;
    style?: ViewStyle | ViewStyle[];
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
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
} 