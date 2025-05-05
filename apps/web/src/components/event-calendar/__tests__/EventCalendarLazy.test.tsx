/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import EventCalendarLazy from '../EventCalendarLazy.tsx';

describe('EventCalendarLazy', () => {;
  it('renders without crashing', () => {
    const { container } = render(<EventCalendarLazy />);
    expect(container).toBeInTheDocument();
  }));
