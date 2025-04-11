# VibeWell Coding Standards

This document outlines the coding standards and best practices to be followed when developing the VibeWell platform. Adhering to these standards ensures maintainability, scalability, and clean code.

## Table of Contents

1. [Code Structure and Organization](#code-structure-and-organization)
2. [Coding Style and Consistency](#coding-style-and-consistency)
3. [React/React Native Guidelines](#reactreact-native-guidelines)
4. [CSS and Styling](#css-and-styling)
5. [Testing and TDD](#testing-and-tdd)
6. [Version Control](#version-control)

## Code Structure and Organization

### Modular and Scalable Structure

- Split code into small, reusable components
- Group components by functionality (auth, payment, booking, etc.)
- Each module or feature should be self-contained

### Folder Structure

```
src/
  ├── components/         # Reusable UI components
  │   ├── auth/           # Authentication components
  │   ├── payment/        # Payment-related components
  │   ├── booking/        # Booking-related components
  │   ├── common/         # Common/shared components
  │   └── layout/         # Layout components (header, footer, etc.)
  ├── services/           # Business logic and API calls
  │   ├── auth/           # Auth-related services
  │   ├── payment/        # Payment-related services
  │   ├── booking/        # Booking-related services
  │   └── api/            # API client and utilities
  ├── hooks/              # Custom React hooks
  ├── utils/              # Utility functions
  ├── pages/              # Page components (for Next.js)
  ├── assets/             # Images, fonts, etc.
  ├── styles/             # Global styles
  └── types/              # TypeScript type definitions
```

## Coding Style and Consistency

### TypeScript

- Use TypeScript for strong typing
- Enforce strict typing throughout the codebase
- Define interfaces for all props, state, and API responses
- Implement proper error handling with typed errors

### ESLint & Prettier

- Use the Airbnb JavaScript Style Guide
- Configure ESLint to enforce style and catch errors
- Use Prettier for consistent code formatting
- Run linting as part of pre-commit hooks

### Naming Conventions

- Use camelCase for variables and functions (e.g., `getUserData`)
- Use PascalCase for components and classes (e.g., `LoginForm`)
- Use UPPER_SNAKE_CASE for constants (e.g., `MAX_LOGIN_ATTEMPTS`)
- Use kebab-case for file names (e.g., `login-form.tsx`)
- Prefix boolean variables with "is", "has", or "should" (e.g., `isLoading`, `hasError`)

### Code Organization

- Import order: React, external libraries, internal modules, styles
- Group related functions and variables together
- Place helper functions after the main component function
- Keep files under 300 lines, splitting larger components when needed

## React/React Native Guidelines

### Functional Components & Hooks

- Use functional components exclusively
- Use React hooks for state management and lifecycle
- Create custom hooks for shared logic

```typescript
// Good example
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
};

// Instead of
class AuthProvider extends Component {
  // ...
}
```

### State Management

- Use React Context for global state
- Use useState and useReducer for local component state
- Consider Redux only for complex state management needs
- Keep state as local as possible
- Derive values where possible instead of storing in state

### Component Best Practices

- Component names should be descriptive and clear
- Keep components focused on a single responsibility
- Implement Error Boundaries to catch and handle errors
- Use prop destructuring for cleaner code
- Use React.memo for expensive computations
- Avoid inline functions in renders when performance is a concern

```typescript
// Good example
const Button: React.FC<ButtonProps> = ({ onClick, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="btn"
  >
    {children}
  </button>
);

// Instead of
const Button = (props) => (
  <button
    type="button"
    onClick={props.onClick}
    disabled={props.disabled}
    className="btn"
  >
    {props.children}
  </button>
);
```

## CSS and Styling

### TailwindCSS

- Use TailwindCSS for utility-first styling
- Create reusable components for common design patterns
- Use the `@apply` directive sparingly, only for frequently reused styles
- Keep consistent spacing, sizing, and colors using design tokens

```jsx
// Good example
<button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
  Submit
</button>

// Instead of
<button className="submit-button">
  Submit
</button>
```

### BEM for Complex CSS

- When custom CSS is needed, follow BEM (Block Element Modifier) naming conventions
- Keep CSS scoped to components to avoid global conflicts
- Use CSS variables for theming and maintaining consistency

```css
/* Good example */
.card__header {
  /* styles */
}

.card__header--highlighted {
  /* styles */
}

/* Instead of */
.card-header {
  /* styles */
}

.highlighted-header {
  /* styles */
}
```

## Testing and TDD

### Test-Driven Development

- Write tests before implementing features
- Focus on behavior, not implementation details
- Test components in isolation with mocked dependencies

### Jest and React Testing Library

- Use Jest as the test runner and assertion library
- Use React Testing Library for component testing
- Test user interactions and outcomes, not implementation details
- Mock external dependencies for consistent tests

```typescript
// Good example
test('submits form with valid input', async () => {
  render(<LoginForm />);
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

### Coverage Requirements

- Aim for at least a minimum of 80% test coverage
- 100% coverage for critical business logic and core components
- Include unit, integration, and E2E tests
- Write meaningful assertions that validate behavior

## Version Control

### Git Workflow

- Follow GitFlow branching strategy
- Use feature branches for development
- Rebase feature branches to keep history clean
- Create descriptive pull requests with appropriate labels

### Commit Messages

- Follow Conventional Commits format
- Begin with a type: feat, fix, docs, style, refactor, perf, test, chore
- Include a scope when relevant
- Write a descriptive message in imperative present tense

```
feat(auth): add multi-factor authentication support

Implement MFA with SMS and email verification options.

Closes #123
```

### Pull Requests

- Keep PRs focused on a single feature or fix
- Include screenshots for UI changes
- Link to relevant issues
- Add appropriate reviewers
- Ensure all CI checks pass before merging

By following these standards, we ensure a maintainable and scalable codebase for the VibeWell platform. This document should be regularly updated as our standards evolve. 