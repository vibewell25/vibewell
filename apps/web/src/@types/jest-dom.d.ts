

/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> extends jest?.Matchers<R> {}
}
