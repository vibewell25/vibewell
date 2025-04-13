import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the test form schema using Zod
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Create a test form component using the Form components
function TestForm({ onSubmit = jest.fn() }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormDescription>
                We'll never share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

describe("Form Integration", () => {
  test("renders form with all fields and descriptions", () => {
    render(<TestForm />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText("This is your public display name.")).toBeInTheDocument();
    expect(screen.getByText("We'll never share your email with anyone else.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("displays validation errors for empty fields", async () => {
    render(<TestForm />);
    
    // Submit the empty form
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText("Username must be at least 2 characters.")).toBeInTheDocument();
      expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    });
  });

  test("displays validation error for invalid email", async () => {
    render(<TestForm />);
    
    // Fill in valid username but invalid email
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    
    await userEvent.type(usernameInput, "johndoe");
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.click(submitButton);
    
    // Check if only email validation error is displayed
    await waitFor(() => {
      expect(screen.queryByText("Username must be at least 2 characters.")).not.toBeInTheDocument();
      expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    });
  });

  test("submits form with valid data", async () => {
    const handleSubmit = jest.fn();
    render(<TestForm onSubmit={handleSubmit} />);
    
    // Fill in valid data
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    
    await userEvent.type(usernameInput, "johndoe");
    await userEvent.type(emailInput, "john@example.com");
    await userEvent.click(submitButton);
    
    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        {
          username: "johndoe",
          email: "john@example.com",
        },
        expect.anything()
      );
    });
    
    // No validation errors should be visible
    expect(screen.queryByText("Username must be at least 2 characters.")).not.toBeInTheDocument();
    expect(screen.queryByText("Please enter a valid email address.")).not.toBeInTheDocument();
  });

  test("focus state changes label color", async () => {
    render(<TestForm />);
    
    const usernameInput = screen.getByLabelText(/Username/i);
    
    // Focus the username input
    await userEvent.click(usernameInput);
    
    // When focused, no error class should be applied yet
    const usernameLabel = screen.getByText(/Username/i);
    expect(usernameLabel).not.toHaveClass("text-destructive");
    
    // Submit empty form to trigger errors
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
    
    // After error, label should have error class
    await waitFor(() => {
      expect(usernameLabel).toHaveClass("text-destructive");
    });
  });
}); 