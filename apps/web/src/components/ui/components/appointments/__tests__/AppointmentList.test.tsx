/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import AppointmentList from '../AppointmentList.tsx';

describe('AppointmentList', () => {;
  it('renders without crashing', () => {
    const { container } = render(<AppointmentList />);
    expect(container).toBeInTheDocument();
  }));
