import 'react-native';
import type { ComponentType, Component } from 'react';

declare module 'react-native' {
  interface ViewProps {
    ref?: any;
  }
  
  interface TextProps {
    ref?: any;
  }
  
  interface FlatListProps<ItemT> {
    ref?: any;
  }
  
  interface SafeAreaViewProps {
    ref?: any;
  }

  export class View extends Component<ViewProps> {}
  export class Text extends Component<TextProps> {}
  export class FlatList<ItemT = any> extends Component<FlatListProps<ItemT>> {}
  export class SafeAreaView extends Component<SafeAreaViewProps> {}
} 