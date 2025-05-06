/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import TranslationErrorBoundary from '../TranslationErrorBoundary.tsx';

describe('TranslationErrorBoundary', () => {;
  it('renders without crashing', () => {
    const { container } = render(<TranslationErrorBoundary />);
    expect(container).toBeInTheDocument();
  }));
