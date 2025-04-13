import React from "react";
import { render, screen } from "../../test-utils/testing-lib-adapter";
import { userEvent } from "../../test-utils/testing-lib-adapter";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { AccessibleButton } from "@/components/AccessibleButton";

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

describe("AccessibleButton Component", () => {
  test("renders with default props", () => {
    render(<AccessibleButton>Click me</AccessibleButton>);
    
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("h-10"); // md size
  });

  test("renders with different variants", () => {
    const { rerender } = render(
      <AccessibleButton variant="primary">Primary</AccessibleButton>
    );
    let button = screen.getByRole("button", { name: /primary/i });
    expect(button).toHaveClass("bg-primary");
    
    rerender(<AccessibleButton variant="secondary">Secondary</AccessibleButton>);
    button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toHaveClass("bg-secondary");
    
    rerender(<AccessibleButton variant="outline">Outline</AccessibleButton>);
    button = screen.getByRole("button", { name: /outline/i });
    expect(button).toHaveClass("border-input");
    
    rerender(<AccessibleButton variant="ghost">Ghost</AccessibleButton>);
    button = screen.getByRole("button", { name: /ghost/i });
    expect(button).toHaveClass("hover:bg-accent");
  });

  test("renders with different sizes", () => {
    const { rerender } = render(
      <AccessibleButton size="sm">Small</AccessibleButton>
    );
    let button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("h-9");
    
    rerender(<AccessibleButton size="md">Medium</AccessibleButton>);
    button = screen.getByRole("button", { name: /medium/i });
    expect(button).toHaveClass("h-10");
    
    rerender(<AccessibleButton size="lg">Large</AccessibleButton>);
    button = screen.getByRole("button", { name: /large/i });
    expect(button).toHaveClass("h-11");
  });

  test("renders in loading state", () => {
    render(<AccessibleButton isLoading>Loading</AccessibleButton>);
    
    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveClass("opacity-50");
    
    // Check if loading spinner is present
    const loadingSpinner = screen.getByText("⌛");
    expect(loadingSpinner).toBeInTheDocument();
  });

  test("renders with icons", () => {
    render(
      <AccessibleButton 
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        With Icons
      </AccessibleButton>
    );
    
    const leftIcon = screen.getByTestId("left-icon");
    const rightIcon = screen.getByTestId("right-icon");
    
    expect(leftIcon).toBeInTheDocument();
    expect(rightIcon).toBeInTheDocument();
    expect(leftIcon.getAttribute("aria-hidden")).toBe("true");
    expect(rightIcon.getAttribute("aria-hidden")).toBe("true");
  });

  test("handles click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<AccessibleButton onClick={handleClick}>Clickable</AccessibleButton>);
    
    const button = screen.getByRole("button", { name: /clickable/i });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("should not trigger onClick when disabled", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <AccessibleButton onClick={handleClick} disabled>
        Disabled
      </AccessibleButton>
    );
    
    const button = screen.getByRole("button", { name: /disabled/i });
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("should not trigger onClick when loading", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <AccessibleButton onClick={handleClick} isLoading>
        Loading
      </AccessibleButton>
    );
    
    const button = screen.getByRole("button", { name: /loading/i });
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("has no accessibility violations", async () => {
    const { container } = render(
      <AccessibleButton>Accessible Button</AccessibleButton>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 