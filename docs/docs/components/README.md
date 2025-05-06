# VibeWell Component Library Documentation

## Overview
This documentation covers all reusable components in the VibeWell application, including their props, usage examples, and best practices.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Component Categories](#component-categories)
3. [Design System](#design-system)
4. [Contributing](#contributing)

## Getting Started
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Theming](#theming)

## Component Categories
- [Authentication Components](./auth/README.md)
- [Layout Components](./layout/README.md)
- [Form Components](./form/README.md)
- [Navigation Components](./navigation/README.md)
- [Data Display Components](./data-display/README.md)
- [Feedback Components](./feedback/README.md)
- [Media Components](./media/README.md)

## Design System
- [Colors](./design-system/colors.md)
- [Typography](./design-system/typography.md)
- [Spacing](./design-system/spacing.md)
- [Breakpoints](./design-system/breakpoints.md)
- [Icons](./design-system/icons.md)

## Contributing
- [Component Development Guidelines](./contributing/guidelines.md)
- [Testing Requirements](./contributing/testing.md)
- [Documentation Standards](./contributing/documentation.md)

## Installation

```bash
npm install @vibewell/components
# or
yarn add @vibewell/components
```

## Usage

```tsx
import { Button, Card, TextField } from '@vibewell/components';

function MyComponent() {
  return (
    <Card>
      <TextField label="Name" placeholder="Enter your name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## Components

### Core Components

#### Button
```tsx
import { Button } from '@vibewell/components';

<Button
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'text'
  size="medium" // 'small' | 'medium' | 'large'
  disabled={false}
  loading={false}
  onClick={() => {}}
>
  Click Me
</Button>
```

#### TextField
```tsx
import { TextField } from '@vibewell/components';

<TextField
  label="Username"
  placeholder="Enter username"
  error="Invalid username"
  helperText="Must be at least 3 characters"
  value={value}
  onChange={handleChange}
/>
```

#### Card
```tsx
import { Card } from '@vibewell/components';

<Card
  elevation={1} // 0 | 1 | 2 | 3
  padding="medium" // 'none' | 'small' | 'medium' | 'large'
>
  Card Content
</Card>
```

### Layout Components

#### Container
```tsx
import { Container } from '@vibewell/components';

<Container
  maxWidth="lg" // 'sm' | 'md' | 'lg' | 'xl'
  padding={true}
>
  Content
</Container>
```

#### Grid
```tsx
import { Grid } from '@vibewell/components';

<Grid
  container
  spacing={2}
  alignItems="center"
  justifyContent="space-between"
>
  <Grid item xs={12} sm={6} md={4}>
    Item 1
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    Item 2
  </Grid>
</Grid>
```

### Form Components

#### Select
```tsx
import { Select } from '@vibewell/components';

<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  value={selectedValue}
  onChange={handleChange}
/>
```

#### Checkbox
```tsx
import { Checkbox } from '@vibewell/components';

<Checkbox
  label="Remember me"
  checked={checked}
  onChange={handleChange}
/>
```

### Feedback Components

#### Alert
```tsx
import { Alert } from '@vibewell/components';

<Alert
  severity="success" // 'success' | 'error' | 'warning' | 'info'
  onClose={() => {}}
>
  Operation successful!
</Alert>
```

#### Progress
```tsx
import { Progress } from '@vibewell/components';

<Progress
  variant="circular" // 'circular' | 'linear'
  value={75}
  size="medium"
/>
```

## Theming

The component library supports customization through a theme provider:

```tsx
import { ThemeProvider, createTheme } from '@vibewell/components';

const theme = createTheme({
  palette: {
    primary: '#007AFF',
    secondary: '#5856D6',
    error: '#FF3B30',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Accessibility

All components are built with accessibility in mind and follow WCAG 2.1 guidelines. They include:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus management

## Best Practices

1. Always provide labels for form components
2. Use semantic HTML elements
3. Implement proper error handling
4. Follow responsive design principles
5. Maintain consistent styling
6. Test components across different browsers

## Mobile-First Design

All components are designed with a mobile-first approach:

```tsx
import { ResponsiveContainer } from '@vibewell/components';

<ResponsiveContainer
  breakpoints={{
    xs: { columns: 1 },
    sm: { columns: 2 },
    md: { columns: 3 },
    lg: { columns: 4 }
  }}
>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</ResponsiveContainer>
```

## Performance Optimization

### Code Splitting
Components can be imported individually to optimize bundle size:

```tsx
import Button from '@vibewell/components/Button';
import TextField from '@vibewell/components/TextField';
```

### Lazy Loading
For larger components, use lazy loading:

```tsx
import { lazy } from 'react';

const DataGrid = lazy(() => import('@vibewell/components/DataGrid'));
```

## New Components

### DataGrid
Advanced data grid component with sorting, filtering, and pagination:

```tsx
import { DataGrid } from '@vibewell/components';

<DataGrid
  columns={[
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'age', headerName: 'Age', type: 'number', width: 90 },
  ]}
  rows={data}
  pagination
  pageSize={10}
  sortable
  filterable
/>
```

### DatePicker
Customizable date picker with various display options:

```tsx
import { DatePicker } from '@vibewell/components';

<DatePicker
  label="Select Date"
  value={selectedDate}
  onChange={handleDateChange}
  format="MM/DD/YYYY"
  minDate={new Date()}
  disableWeekends
/>
```

### FileUpload
File upload component with drag and drop support:

```tsx
import { FileUpload } from '@vibewell/components';

<FileUpload
  accept=".jpg,.png,.pdf"
  maxSize={5000000}
  multiple
  onUpload={handleUpload}
  onError={handleError}
/>
```

## Animation Support

The library includes built-in animation components:

```tsx
import { Fade, Slide, Grow } from '@vibewell/components/animations';

<Fade in={isVisible} timeout={300}>
  <Card>Animated content</Card>
</Fade>
```

## Testing

### Unit Testing
Example using Jest and React Testing Library:

```tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from '@vibewell/components';

test('Button click handler is called', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <Button onClick={handleClick}>Click Me</Button>
  );
  
  fireEvent.click(getByText('Click Me'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Visual Testing
The library uses Storybook for visual testing:

```bash
npm run storybook
# or
yarn storybook
```

## Internationalization

Components support internationalization through React-Intl:

```tsx
import { IntlProvider } from '@vibewell/components/intl';

<IntlProvider messages={messages} locale="es">
  <App />
</IntlProvider>
```

## Error Boundaries

Built-in error boundary component:

```tsx
import { ErrorBoundary } from '@vibewell/components';

<ErrorBoundary fallback={<ErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Support

- GitHub Issues: [Report a bug](https://github.com/vibewell/components/issues)
- Discord: [Join our community](https://discord.gg/vibewell)
- Documentation: [Full API reference](https://docs.vibewell.com/components)

## License

MIT License - see [LICENSE.md](LICENSE.md) for details

## Core Components

### Layout Components

#### AppLayout
The main layout wrapper for the application.

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
}
```

Example:
```jsx
<AppLayout showHeader showFooter>
  <YourContent />
</AppLayout>
```

#### Container
A responsive container component with consistent padding and max-width.

```typescript
interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  fluid?: boolean;
}
```

### Form Components

#### TextField
A customized text input component with validation support.

```typescript
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
}
```

#### Button
A customizable button component with different variants.

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
```

### Data Display Components

#### Card
A versatile card component for displaying content.

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  elevation?: 0 | 1 | 2 | 3;
  onClick?: () => void;
}
```

#### List
A component for rendering lists with various styles.

```typescript
interface ListProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    onClick?: () => void;
  }>;
  variant?: 'default' | 'divided' | 'bordered';
  spacing?: 'sm' | 'md' | 'lg';
}
```

### Navigation Components

#### Tabs
A tabbed navigation component.

```typescript
interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab?: string;
  onChange?: (tabId: string) => void;
}
```

#### Breadcrumbs
A breadcrumb navigation component.

```typescript
interface BreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  separator?: string | React.ReactNode;
}
```

### Feedback Components

#### Alert
A component for displaying alert messages.

```typescript
interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
  autoHideDuration?: number;
}
```

#### Modal
A modal dialog component.

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  actions?: React.ReactNode;
}
```

## Mobile-Specific Components

### TouchableCard
A card component optimized for touch interactions.

```typescript
interface TouchableCardProps extends CardProps {
  onPress?: () => void;
  rippleColor?: string;
  activeOpacity?: number;
}
```

### BottomSheet
A bottom sheet component for mobile interfaces.

```typescript
interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  height?: number | string;
  children: React.ReactNode;
  snapPoints?: number[];
}
```

## Theming

Components support both light and dark themes through our theme provider:

```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    // ... other color tokens
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  // ... other theme tokens
}
```

To use the theme in a component:

```jsx
import { useTheme } from '@vibewell/theme';

const MyComponent = () => {
  const theme = useTheme();
  return (
    <div style={{ color: theme.colors.text }}>
      Themed content
    </div>
  );
};
```

## Best Practices

1. **Composition Over Inheritance**
   - Use component composition to build complex UIs
   - Leverage render props and children for flexible components

2. **Accessibility**
   - All components support ARIA attributes
   - Keyboard navigation is implemented where appropriate
   - Color contrast meets WCAG guidelines

3. **Responsive Design**
   - Components are mobile-first by default
   - Use breakpoint utilities for responsive behavior

4. **Performance**
   - Components are optimized for re-renders
   - Heavy components support lazy loading
   - Images use proper loading strategies

## Testing

Components include:
- Unit tests with Jest and React Testing Library
- Integration tests for complex interactions
- Visual regression tests with Storybook
- Accessibility tests with jest-axe

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

## Contributing

1. Follow the component structure:
   ```
   components/
   ├── ComponentName/
   │   ├── index.ts
   │   ├── ComponentName.tsx
   │   ├── ComponentName.test.tsx
   │   ├── ComponentName.stories.tsx
   │   └── styles.ts
   ```

2. Document props using TypeScript interfaces
3. Include usage examples
4. Add unit tests
5. Update Storybook stories 