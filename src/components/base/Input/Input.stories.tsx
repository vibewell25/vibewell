import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Base/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
    success: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter text...',
    error: 'This field is required',
  },
};

export const WithSuccess: Story = {
  args: {
    placeholder: 'Enter text...',
    success: 'Valid input',
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const WithLabel: Story = {
  render: args => (
    <div className="space-y-2">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <Input id="email" type="email" placeholder="Enter your email..." {...args} />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: args => (
    <div className="space-y-2">
      <label htmlFor="password" className="text-sm font-medium">
        Password
      </label>
      <Input id="password" type="password" placeholder="Enter your password..." {...args} />
      <p className="text-sm text-muted-foreground">Password must be at least 8 characters long</p>
    </div>
  ),
};
