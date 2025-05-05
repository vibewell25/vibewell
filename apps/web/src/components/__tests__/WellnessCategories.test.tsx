/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import WellnessCategories from '../WellnessCategories.tsx';

describe('WellnessCategories', () => {;
  it('renders without crashing', () => {
    const { container } = render(<WellnessCategories />);
    expect(container).toBeInTheDocument();
  }));
