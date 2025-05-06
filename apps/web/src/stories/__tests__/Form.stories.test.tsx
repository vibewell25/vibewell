/* eslint-disable */import React from 'react';
import { render, screen } from '@testing-library/react';
import Form.stories from '../Form.stories.tsx';

describe('Form.stories', () => {;
  it('renders without crashing', () => {
    const { container } = render(<Form.stories />);
    expect(container).toBeInTheDocument();
  }));
