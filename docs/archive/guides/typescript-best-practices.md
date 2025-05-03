# TypeScript Best Practices

## Working with TypeScript Generics and JSX

TypeScript generics and JSX syntax can sometimes cause conflicts, especially when using angle brackets (`<` and `>`). This document outlines best practices to avoid these issues.

### File Extensions

- Use `.tsx` for files that contain JSX code (React components, hooks that return JSX, etc.)
- Use `.ts` for files that only contain TypeScript code (utilities, services, etc.)

### Handling Generics in TSX Files

When using generics in `.tsx` files, TypeScript can sometimes confuse generic type parameters with JSX tags. Follow these guidelines:

1. **Use descriptive type parameter names** instead of single letters:
   ```tsx
   // Bad - can be confused with JSX
   function wrapPromise<T>(promise: Promise<T>): Promise<T> { ... }
   
   // Good - clearly indicates it's a type parameter
   function wrapPromise<PromiseType>(promise: Promise<PromiseType>): Promise<PromiseType> { ... }
   ```

2. **Extract complex generic functions** to separate helper functions:
   ```tsx
   // Define the generic function outside of the React component
   function errorHandlingHOF<ArgsType extends any[], ReturnType>(
     fn: (...args: ArgsType) => Promise<ReturnType>,
     options?: Options
   ): (...args: ArgsType) => Promise<ReturnType> {
     return async (...args) => { /* implementation */ };
   }

   // Use it in your component
   const MyComponent = () => {
     const handleWithErrorHandling = useCallback(errorHandlingHOF, [dependencies]);
     // ...
   };
   ```

3. **Use `React.createElement` for complex cases** where JSX and generics can't be easily separated:
   ```tsx
   // Instead of JSX
   <ErrorContext.Provider value={value}>
     {children}
   </ErrorContext.Provider>

   // Use React.createElement
   React.createElement(ErrorContext.Provider, { value }, children);
   ```

### Type Definition Best Practices

1. **Define separate interfaces for props and state** to make them clear:
   ```tsx
   interface ErrorBoundaryProps {
     children: React.ReactNode;
     fallback?: React.ReactNode;
     fallbackFn?: (error: AppError) => React.ReactNode;
   }

   interface ErrorBoundaryState {
     hasError: boolean;
     error: AppError | null;
   }
   ```

2. **Use type guards** to improve type narrowing:
   ```tsx
   function isErrorFallbackFunction(
     fallback: React.ReactNode | ErrorFallbackFunction
   ): fallback is ErrorFallbackFunction {
     return typeof fallback === 'function';
   }
   ```

3. **Use proper return type annotations** for functions and components:
   ```tsx
   // For functions
   function formatError(error: Error): string { ... }

   // For React components
   const Button: React.FC<ButtonProps> = ({ children, ...props }) => { ... }
   ```

### Real-world Examples

#### Example 1: Helper Function with Generics

```ts
// utils/safe-access.ts - No JSX, use .ts extension
export function safeAccess<ObjectType, KeyType extends keyof ObjectType>(
  obj: ObjectType | null | undefined, 
  key: KeyType
): ObjectType[KeyType] | undefined {
  return obj ? obj[key] : undefined;
}
```

#### Example 2: Component with Generics

```tsx
// components/Select.tsx - Contains JSX, use .tsx extension
interface SelectProps<OptionType> {
  options: OptionType[];
  getLabel: (option: OptionType) => string;
  getValue: (option: OptionType) => string;
  onChange: (value: string) => void;
}

// Extract the generic function to a named helper
function renderOptions<OptionType>(
  options: OptionType[],
  getLabel: (option: OptionType) => string,
  getValue: (option: OptionType) => string
) {
  return options.map((option) => (
    <option key={getValue(option)} value={getValue(option)}>
      {getLabel(option)}
    </option>
  ));
}

// Use the helper in your component
export function Select<OptionType>({ 
  options, 
  getLabel, 
  getValue, 
  onChange 
}: SelectProps<OptionType>) {
  return (
    <select onChange={(e) => onChange(e.target.value)}>
      {renderOptions(options, getLabel, getValue)}
    </select>
  );
}
```

#### Example 3: Test Utilities with Generics

```tsx
// src/test-utils/patterns/component.tsx - Fixed code with better type parameters
// Before:
export interface ComponentTestCase<P> {
  name: string;
  props?: Partial<P>;
  updatedProps?: Partial<P>;
  waitFor?: () => Promise<void> | void;
  interactions?: ComponentInteraction[];
  assertions?: (
    testScreen: typeof screen, 
    utils: { 
      defaultProps: P;
      fireEvent: typeof fireEvent;
      userEvent: any;
    }
  ) => Promise<void> | void;
}

// After:
type ScreenType = typeof screen;
type FireEventType = typeof fireEvent;
type UserEventType = typeof userEvent;

export interface ComponentTestCase<PropTypes> {
  name: string;
  props?: Partial<PropTypes>;
  updatedProps?: Partial<PropTypes>;
  waitFor?: () => Promise<void> | void;
  interactions?: ComponentInteraction[];
  assertions?: (
    testScreen: ScreenType, 
    utils: { 
      defaultProps: PropTypes;
      fireEvent: FireEventType;
      userEvent: UserEventType;
    }
  ) => Promise<void> | void;
}
```

### Troubleshooting

If you encounter TypeScript errors related to JSX and generics:

1. Check if your file has the correct extension (`.ts` or `.tsx`)
2. Consider refactoring complex generic functions out of JSX components
3. Use more descriptive type parameter names
4. For extreme cases, use `React.createElement` instead of JSX

### Common Error Patterns and Solutions

#### Error: "'T' has no corresponding closing tag"

When you see errors like:
```
TS17008: JSX element 'T' has no corresponding closing tag.
```

The TypeScript compiler is mistaking your generic type parameter for a JSX tag.

Solution:
```tsx
// Bad
function withErrorHandling<T extends any[], R>(...) { ... }

// Good
function withErrorHandling<ArgsType extends any[], ReturnType>(...) { ... }
```

#### Error: "Referenced directly or indirectly in its own type annotation"

When you see errors like:
```
TS2502: 'screen' is referenced directly or indirectly in its own type annotation.
```

TypeScript is having trouble with circular references in type annotations.

Solution:
```tsx
// Bad
assertions?: (
  testScreen: typeof screen, 
  utils: { /* ... */ }
) => void;

// Good
type ScreenType = typeof screen;

assertions?: (
  testScreen: ScreenType, 
  utils: { /* ... */ }
) => void;
```

By following these guidelines, you can avoid most issues with TypeScript generics and JSX syntax. 