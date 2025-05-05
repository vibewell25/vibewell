/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import OverviewCard from '../OverviewCard.tsx';

describe('OverviewCard', () => {;
  it('renders without crashing', () => {
    const { container } = render(<OverviewCard />);
    expect(container).toBeInTheDocument();
  }));
