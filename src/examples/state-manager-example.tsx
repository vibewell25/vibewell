import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { createState, StateManagerType } from '@/utils/state-manager';

// Example 1: Context-based state management
interface CounterState {
  count: number;
}

// Create a counter state using Context API
const counterManager = createState<CounterState>(
  { count: 0 },
  StateManagerType.CONTEXT
);

// Type assertion to get the correct type
const counterContext = counterManager as {
  StateContext: React.Context<[CounterState, React.Dispatch<React.SetStateAction<CounterState>>] | undefined>;
  useStateContext: () => readonly [CounterState, (update: Partial<CounterState> | ((prev: CounterState) => CounterState)) => void];
};

// Create a component wrapper for the provider
const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CounterState>({ count: 0 });
  
  return (
    <counterContext.StateContext.Provider value={[state, setState]}>
      {children}
    </counterContext.StateContext.Provider>
  );
};

// Counter component using context state
const CounterWithContext: React.FC = () => {
  const [state, setState] = counterContext.useStateContext();
  
  const increment = () => setState({ count: state.count + 1 });
  const decrement = () => setState({ count: state.count - 1 });
  
  return (
    <div>
      <h2>Context Counter: {state.count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

// Example 2: Redux-based state management
interface TodoState {
  todos: string[];
}

// Create a todo state using Redux
const todoManager = createState<TodoState>(
  { todos: [] },
  StateManagerType.REDUX,
  { sliceName: 'todos' }
);

// Type assertion to get the correct type
const todoRedux = todoManager as {
  store: unknown;
  reducer: unknown;
  useReduxState: () => {
    state: TodoState;
    dispatch: (action: { type: string; payload: unknown }) => void;
    actions: {
      updateState: (value: Partial<TodoState>) => { type: string; payload: Partial<TodoState> };
      setState: (value: TodoState) => { type: string; payload: TodoState };
    };
  };
  actions: Record<string, unknown>;
};

// Todo component using Redux state
const TodosWithRedux: React.FC = () => {
  const { state, dispatch, actions } = todoRedux.useReduxState();
  const [newTodo, setNewTodo] = useState('');
  
  const addTodo = () => {
    if (newTodo.trim()) {
      dispatch(actions.updateState({
        todos: [...state.todos, newTodo]
      }));
      setNewTodo('');
    }
  };
  
  const clearTodos = () => {
    dispatch(actions.updateState({ todos: [] }));
  };
  
  return (
    <div>
      <h2>Redux Todos</h2>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a todo"
      />
      <button onClick={addTodo}>Add</button>
      <button onClick={clearTodos}>Clear All</button>
      
      <ul>
        {state.todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
};

// Example 3: Zustand-based state management
interface ThemeState {
  darkMode: boolean;
  fontSize: number;
}

// Create actions for the theme state
const themeActions = {
  toggleDarkMode: (state: ThemeState) => ({
    ...state,
    darkMode: !state.darkMode
  }),
  increaseFontSize: (state: ThemeState) => ({
    ...state,
    fontSize: Math.min(state.fontSize + 1, 24)
  }),
  decreaseFontSize: (state: ThemeState) => ({
    ...state,
    fontSize: Math.max(state.fontSize - 1, 12)
  })
};

// Create a theme state using Zustand
const themeManager = createState<ThemeState>(
  { darkMode: false, fontSize: 16 },
  StateManagerType.ZUSTAND,
  { actions: themeActions }
);

// Use a safer casting approach for Zustand
// First cast to unknown, then to the desired type
const themeZustand = (themeManager as unknown) as {
  useStore: () => ThemeState & {
    set: (update: Partial<ThemeState> | ((state: ThemeState) => Partial<ThemeState>)) => void;
  };
  actions: {
    toggleDarkMode: () => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
  };
};

// Theme component using Zustand state
const ThemeWithZustand: React.FC = () => {
  const { darkMode, fontSize } = themeZustand.useStore();
  const { toggleDarkMode, increaseFontSize, decreaseFontSize } = themeZustand.actions;
  
  const theme = {
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#fff' : '#333',
    fontSize: `${fontSize}px`
  };
  
  return (
    <div style={theme}>
      <h2>Zustand Theme Settings</h2>
      <p>
        This text will change based on the theme settings.
        Current font size: {fontSize}px
      </p>
      
      <button onClick={() => toggleDarkMode()}>
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
      <button onClick={() => increaseFontSize()}>Increase Font Size</button>
      <button onClick={() => decreaseFontSize()}>Decrease Font Size</button>
    </div>
  );
};

// Combined example
const StateManagerExample: React.FC = () => {
  return (
    <CounterProvider>
      <Provider store={todoRedux.store}>
        <div>
          <h1>State Manager Examples</h1>
          
          <section>
            <h2>Context Example</h2>
            <CounterWithContext />
          </section>
          
          <section>
            <h2>Redux Example</h2>
            <TodosWithRedux />
          </section>
          
          <section>
            <h2>Zustand Example</h2>
            <ThemeWithZustand />
          </section>
        </div>
      </Provider>
    </CounterProvider>
  );
};

export default StateManagerExample; 