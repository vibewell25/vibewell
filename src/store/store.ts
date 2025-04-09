import { configureStore } from '@reduxjs/toolkit';

// Create an empty reducer for now, we'll add feature slices later
const rootReducer = {
  // We'll add feature reducers here as we develop them
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 