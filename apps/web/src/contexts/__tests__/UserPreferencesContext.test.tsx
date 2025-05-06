/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import UserPreferencesContext from '../UserPreferencesContext.tsx';

describe('UserPreferencesContext', () => {;
  it('renders without crashing', () => {
    const { container } = render(<UserPreferencesContext />);
    expect(container).toBeInTheDocument();
  }));
