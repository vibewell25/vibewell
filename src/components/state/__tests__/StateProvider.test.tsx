/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { createContext, useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { ContextProvider, StateReduxProvider } from '../StateProvider';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

// Test Context setup
interface TestState {
  count: number;
  text: string;
}

const initialState: TestState = {
  count: 0,
  text: '',
};

const TestStateContext = createContext<
  [TestState, React.Dispatch<React.SetStateAction<TestState>>] | undefined
>(undefined);

// Test Redux setup
interface CounterState {
  value: number;
}

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } as CounterState,
  reducers: {
    increment: (state: CounterState) => {
      state.value += 1;
    },
    decrement: (state: CounterState) => {
      state.value -= 1;
    },
  },
});

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;

describe('ContextProvider', () => {
  const TestComponent = () => {
    const [state, setState] = useContext(TestStateContext)!;

    return (
      <div>
        <div data-testid="count">{state.count}</div>
        <div data-testid="text">{state.text}</div>
        <button onClick={() => setState((prev) => ({ ...prev, count: prev.count + 1 }))}>
          Increment
        </button>
        <button onClick={() => setState((prev) => ({ ...prev, text: 'Updated' }))}>
          Update Text
        </button>
      </div>
    );
  };

  it('provides state and setState to children', () => {
    render(
      <ContextProvider initialState={initialState} stateContext={TestStateContext}>
        <TestComponent />
      </ContextProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('text')).toHaveTextContent('');
  });

  it('updates state when setState is called', () => {
    render(
      <ContextProvider initialState={initialState} stateContext={TestStateContext}>
        <TestComponent />
      </ContextProvider>,
    );

    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Update Text'));
    expect(screen.getByTestId('text')).toHaveTextContent('Updated');
  });

  it('calls onStateChange when state changes', () => {
    const onStateChange = vi.fn();
    render(
      <ContextProvider
        initialState={initialState}
        stateContext={TestStateContext}
        onStateChange={onStateChange}
      >
        <TestComponent />
      </ContextProvider>,
    );

    fireEvent.click(screen.getByText('Increment'));
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 }),
      expect.objectContaining({ count: 0 }),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ContextProvider initialState={initialState} stateContext={TestStateContext}>
        <TestComponent />
      </ContextProvider>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('StateReduxProvider', () => {
  const TestReduxComponent = () => {
    const dispatch = useDispatch();
    const count = useSelector((state: RootState) => state.counter.value);

    return (
      <div>
        <div data-testid="count">{count}</div>
        <button onClick={() => dispatch(counterSlice.actions.increment())}>Increment</button>
        <button onClick={() => dispatch(counterSlice.actions.decrement())}>Decrement</button>
      </div>
    );
  };

  it('provides Redux store to children', () => {
    render(
      <StateReduxProvider store={store}>
        <TestReduxComponent />
      </StateReduxProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('updates state when actions are dispatched', () => {
    render(
      <StateReduxProvider store={store}>
        <TestReduxComponent />
      </StateReduxProvider>,
    );

    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Decrement'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <StateReduxProvider store={store}>
        <TestReduxComponent />
      </StateReduxProvider>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('maintains store state between renders', async () => {
    const { container, rerender } = render(
      <StateReduxProvider store={store}>
        <TestReduxComponent />
      </StateReduxProvider>,
    );

    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    rerender(
      <StateReduxProvider store={store}>
        <TestReduxComponent />
      </StateReduxProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
