/**
 * Component Composition Refactoring Plan
 * 
 * This file defines the approach for refactoring components in the Vibewell platform
 * to improve composability, reusability, and maintainability.
 */

import { ComponentCategory, ComponentComplexity } from './component-standards';

/**
 * Component audit item structure
 */
export interface ComponentAuditItem {
  name: string;
  path: string;
  category: ComponentCategory;
  complexity: ComponentComplexity;
  issues: ComponentIssue[];
  refactoringPriority: 'high' | 'medium' | 'low';
}

/**
 * Types of component issues that require refactoring
 */
export enum ComponentIssueType {
  TOO_COMPLEX = 'too_complex',
  PROP_DRILLING = 'prop_drilling',
  MIXED_CONCERNS = 'mixed_concerns',
  STYLING_INCONSISTENCY = 'styling_inconsistency',
  ACCESSIBILITY_ISSUE = 'accessibility_issue',
  PERFORMANCE_ISSUE = 'performance_issue',
  DUPLICATE_LOGIC = 'duplicate_logic',
  HARD_CODED_VALUES = 'hard_coded_values',
  POOR_COMPOSITION = 'poor_composition',
  TEST_COVERAGE = 'test_coverage'
}

/**
 * Component issue structure
 */
export interface ComponentIssue {
  type: ComponentIssueType;
  description: string;
  refactoringApproach: string;
}

/**
 * Component refactoring strategy
 */
export enum RefactoringStrategy {
  COMPONENT_SPLITTING = 'component_splitting',
  CUSTOM_HOOKS = 'custom_hooks',
  CONTEXT_API = 'context_api',
  COMPOUND_COMPONENTS = 'compound_components',
  RENDER_PROPS = 'render_props',
  HIGHER_ORDER_COMPONENTS = 'higher_order_components',
  COMPOSITION_OVER_PROPS = 'composition_over_props'
}

/**
 * Component refactoring phases
 */
export const REFACTORING_PHASES = {
  phase1: {
    name: 'Audit & Planning',
    tasks: [
      'Identify components with high refactoring priority',
      'Document component issues and refactoring approaches',
      'Create test plans for refactored components',
    ]
  },
  phase2: {
    name: 'Core Components',
    tasks: [
      'Refactor UI components in src/components/ui',
      'Implement base components for consistent patterns',
      'Add comprehensive component documentation',
    ]
  },
  phase3: {
    name: 'Feature Components',
    tasks: [
      'Refactor feature-specific components using base components',
      'Extract business logic into custom hooks',
      'Improve component composition to minimize prop drilling',
    ]
  },
  phase4: {
    name: 'Page Components',
    tasks: [
      'Refactor page-level components',
      'Implement layout compositions',
      'Optimize component rendering with proper memoization',
    ]
  },
  phase5: {
    name: 'Validation & Documentation',
    tasks: [
      'Verify components meet accessibility standards',
      'Ensure comprehensive test coverage',
      'Update component documentation and examples',
    ]
  }
};

/**
 * Best practices for component composition
 */
export const COMPONENT_COMPOSITION_BEST_PRACTICES = [
  {
    name: 'Single Responsibility Principle',
    description: 'Components should have a single responsibility and reason to change',
    example: `
// Bad: Component doing too much
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setIsLoading(false);
    });
  }, [userId]);
  
  return (
    <div>
      {isLoading ? <Spinner /> : (
        <>
          <h2>{user.name}</h2>
          <UserAddress address={user.address} />
          <UserOrders orders={user.orders} />
        </>
      )}
    </div>
  );
}

// Good: Split into smaller components with single responsibilities
function UserProfile({ userId }) {
  return (
    <div>
      <UserData userId={userId}>
        {(user, isLoading) => (
          <>
            {isLoading ? <Spinner /> : (
              <>
                <UserHeader user={user} />
                <UserDetails user={user} />
              </>
            )}
          </>
        )}
      </UserData>
    </div>
  );
}
    `
  },
  {
    name: 'Composition Over Props',
    description: 'Use component composition instead of prop drilling',
    example: `
// Bad: Prop drilling through multiple components
function Page({ user }) {
  return <Header user={user} />;
}

function Header({ user }) {
  return (
    <div>
      <Logo />
      <UserBadge user={user} />
    </div>
  );
}

// Good: Use composition to avoid prop drilling
function Page({ user }) {
  return (
    <Header right={<UserBadge user={user} />} />
  );
}

function Header({ right }) {
  return (
    <div>
      <Logo />
      {right}
    </div>
  );
}
    `
  },
  {
    name: 'Custom Hooks for Logic',
    description: 'Extract complex logic into custom hooks',
    example: `
// Bad: Component with mixed UI and logic concerns
function UserList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {users.map(user => <UserItem key={user.id} user={user} />)}
    </div>
  );
}

// Good: Logic extracted into custom hook
function useUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  return { users, isLoading, error };
}

function UserList() {
  const { users, isLoading, error } = useUsers();
  
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {users.map(user => <UserItem key={user.id} user={user} />)}
    </div>
  );
}
    `
  },
  {
    name: 'Compound Components',
    description: 'Use compound components for complex component relationships',
    example: `
// Bad: Monolithic component with many props
function Tabs({ tabs, activeIndex, onChange }) {
  return (
    <div>
      <div className="tabs-header">
        {tabs.map((tab, i) => (
          <button 
            key={i}
            className={i === activeIndex ? 'active' : ''}
            onClick={() => onChange(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs[activeIndex].content}
      </div>
    </div>
  );
}

// Good: Compound components pattern
function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tabs-header">{children}</div>;
}

function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useTabsContext();
  return (
    <button 
      className={index === activeIndex ? 'active' : ''}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div className="tabs-content">{children}</div>;
}

function TabPanel({ index, children }) {
  const { activeIndex } = useTabsContext();
  return activeIndex === index ? children : null;
}

// Usage
function App() {
  return (
    <Tabs>
      <TabList>
        <Tab index={0}>Profile</Tab>
        <Tab index={1}>Settings</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>Profile content</TabPanel>
        <TabPanel index={1}>Settings content</TabPanel>
      </TabPanels>
    </Tabs>
  );
}
    `
  },
  {
    name: 'Render Props',
    description: 'Use render props for component with configurable rendering',
    example: `
// Using render props for configurable content
function ResourceLoader({ resourceId, renderLoading, renderError, renderSuccess }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadResource() {
      try {
        setIsLoading(true);
        const response = await fetch(\`/api/resources/\${resourceId}\`);
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadResource();
  }, [resourceId]);
  
  if (isLoading) {
    return renderLoading ? renderLoading() : <div>Loading...</div>;
  }
  
  if (error) {
    return renderError ? renderError(error) : <div>Error: {error.message}</div>;
  }
  
  return renderSuccess(data);
}

// Alternative render prop pattern using children
function ResourceLoader({ resourceId, children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ... same effect as above
  
  return children({ data, isLoading, error });
}

// Usage
<ResourceLoader resourceId="123">
  {({ data, isLoading, error }) => {
    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    return <ResourceDisplay data={data} />;
  }}
</ResourceLoader>
    `
  }
];

/**
 * Refactoring plan implementation steps
 */
export const IMPLEMENTATION_STEPS = [
  {
    step: 1,
    name: 'Component Audit',
    description: 'Conduct a thorough audit of existing components',
    tasks: [
      'Create a list of all components in the application',
      'Categorize components by complexity and type',
      'Identify issues and refactoring opportunities',
      'Prioritize components for refactoring',
    ]
  },
  {
    step: 2,
    name: 'Base Component Creation',
    description: 'Create or refine base components',
    tasks: [
      'Implement standardized base components',
      'Ensure full accessibility compliance',
      'Create comprehensive test coverage',
      'Document component APIs and usage examples',
    ]
  },
  {
    step: 3,
    name: 'Component Refactoring',
    description: 'Refactor existing components to use the new patterns',
    tasks: [
      'Start with high-priority components',
      'Apply appropriate refactoring strategies',
      'Maintain or improve test coverage',
      'Update documentation to reflect changes',
    ]
  },
  {
    step: 4,
    name: 'Validation and Testing',
    description: 'Validate refactored components',
    tasks: [
      'Verify refactored components match designs',
      'Test for accessibility compliance',
      'Check performance impact',
      'Ensure backward compatibility',
    ]
  },
  {
    step: 5,
    name: 'Documentation and Guidelines',
    description: 'Update documentation and establish guidelines',
    tasks: [
      'Create examples for each refactoring pattern',
      'Update component documentation',
      'Establish coding guidelines for future components',
      'Create a component showcase for developers',
    ]
  },
];

/**
 * Tool functions to help with refactoring
 */
export const componentAnalysisTools = {
  /**
   * Analyzes a component file to suggest refactoring approaches
   * @param componentPath Path to the component file
   * @returns Suggested refactoring approaches
   */
  analyzeComponent: (componentPath: string): ComponentIssue[] => {
    // This would be implemented to actually analyze component code
    // For now, it's a placeholder
    return [];
  },
  
  /**
   * Creates a test plan for a refactored component
   * @param componentPath Path to the component file
   * @returns Test plan for the component
   */
  createTestPlan: (componentPath: string): string[] => {
    // This would be implemented to generate test plans
    // For now, it's a placeholder
    return [];
  }
};

/**
 * Component Refactoring Implementation Roadmap
 */
export const REFACTORING_ROADMAP = {
  sprint1: {
    name: 'Base Components & Guidelines',
    goals: [
      'Complete component audit',
      'Refine base component architecture',
      'Create component composition guidelines',
      'Refactor 3-5 high-priority components',
    ]
  },
  sprint2: {
    name: 'UI Component Refactoring',
    goals: [
      'Refactor remaining UI components',
      'Implement compound component patterns',
      'Extract common logic to custom hooks',
      'Improve test coverage to 70%',
    ]
  },
  sprint3: {
    name: 'Feature Component Refactoring',
    goals: [
      'Refactor feature-specific components',
      'Improve component composition in complex UIs',
      'Remove prop drilling with composition patterns',
      'Implement context where appropriate',
    ]
  },
  sprint4: {
    name: 'Page Component Refactoring',
    goals: [
      'Refactor page components',
      'Optimize component rendering',
      'Implement component Code Splitting',
      'Create lazy-loading patterns',
    ]
  },
  sprint5: {
    name: 'Documentation & Finalization',
    goals: [
      'Complete component documentation',
      'Create component showcase',
      'Establish ongoing component maintenance guidelines',
      'Train team on new component patterns',
    ]
  }
}; 