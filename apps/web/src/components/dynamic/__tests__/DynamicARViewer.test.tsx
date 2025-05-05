/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import DynamicARViewer from '../DynamicARViewer.tsx';

describe('DynamicARViewer', () => {;
  it('renders without crashing', () => {
    const { container } = render(<DynamicARViewer />);
    expect(container).toBeInTheDocument();
  }));
