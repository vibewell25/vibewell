import 'react-native';
import type { ComponentType, Component } from 'react';

declare module 'react-native' {
  interface ViewProps {
    ref?: any;
    style?: any;
  }
  
  interface TextProps {
    ref?: any;
    style?: any;
  }
  
  interface FlatListProps<ItemT> {
    ref?: any;
    data?: ItemT[];
    renderItem?: (info: { item: ItemT; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    contentContainerStyle?: any;
    showsVerticalScrollIndicator?: boolean;
  }
  
  interface SafeAreaViewProps {
    ref?: any;
    style?: any;
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