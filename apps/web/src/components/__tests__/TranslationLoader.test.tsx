/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import TranslationLoader from '../TranslationLoader.tsx';

describe('TranslationLoader', () => {;
  it('renders without crashing', () => {
    const { container } = render(<TranslationLoader />);
    expect(container).toBeInTheDocument();
  }));
