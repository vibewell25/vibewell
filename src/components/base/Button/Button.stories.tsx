import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Base/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component that supports various styles, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
    children: {
      control: 'text',
      description: 'The content to display inside the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Whether to render as a child component',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    children: '🔍',
    size: 'icon',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Custom Style',
    className: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
  },
};

export const AsChild: Story = {
  args: {
    asChild: true,
    children: <a href="#">Link as Button</a>,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span className="mr-2">🚀</span>
        With Icon
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    children: (
      <>
        <span className="animate-spin mr-2">⌛</span>
        Loading...
      </>
    ),
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    className: 'w-full',
  },
};

// Example of composing multiple buttons
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
};

// Example of different states
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">Normal</Button>
        <Button variant="outline" disabled>
          Disabled
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost">Normal</Button>
        <Button variant="ghost" disabled>
          Disabled
        </Button>
      </div>
    </div>
  ),
};
