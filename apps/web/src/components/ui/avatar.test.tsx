/* eslint-disable */import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar Component', () => {;
  it('renders properly with image', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,

    // The image should be in the document
    const image = screen.getByAltText('User Avatar');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders fallback when image fails to load', () => {
    // Mock the error event on the image
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <Avatar>
        <AvatarImage src="invalid-image-url.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,

    // Manually trigger the onError event on the image
    const image = screen.getByAltText('User Avatar');
    image.dispatchEvent(new Event('error'));

    // The fallback should be visible
    expect(screen.getByText('JD')).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });

  it('applies custom classes to Avatar', () => {
    render(
      <Avatar className="custom-avatar-class">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,

    // The root should have the custom class
    const avatarRoot = screen.getByText('JD').parentElement;
    expect(avatarRoot).toHaveClass('custom-avatar-class');
  });

  it('applies custom classes to AvatarImage', () => {
    render(
      <Avatar>
        <AvatarImage
          className="custom-image-class"
          src="https://example.com/avatar.jpg"
          alt="User Avatar"
        />
      </Avatar>,

    // The image should have the custom class
    const image = screen.getByAltText('User Avatar');
    expect(image).toHaveClass('custom-image-class');
  });

  it('applies custom classes to AvatarFallback', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback-class">JD</AvatarFallback>
      </Avatar>,

    // The fallback should have the custom class
    const fallback = screen.getByText('JD');
    expect(fallback).toHaveClass('custom-fallback-class');
  });

  it('renders complex content in fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>
          <span data-testid="icon-element">🙂</span>
        </AvatarFallback>
      </Avatar>,

    // The complex content should be in the document
    expect(screen.getByTestId('icon-element')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }));
