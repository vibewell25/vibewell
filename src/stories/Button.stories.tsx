import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'The visual style variant of the button',
      table: {
        type: { summary: 'primary | secondary | outline' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
      table: {
        type: { summary: 'sm | md | lg' },
        defaultValue: { summary: 'md' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Shows a loading spinner',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes the button take full width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when the button is clicked',
    },
  },
  parameters: {
    componentSubtitle: 'A versatile button component for triggering actions',
    docs: {
      description: {
        component: `
### Overview
The Button component is a flexible and reusable button that supports various styles, sizes, and states.
It follows accessibility best practices and provides visual feedback for different interactions.

### Accessibility
- Uses native \`<button>\` element
- Supports keyboard navigation (Tab, Enter, Space)
- Maintains ARIA states (disabled, loading)
- Provides focus indicators
- Color contrast compliant
- Screen reader friendly

### Best Practices
- Use clear and action-oriented labels
- Choose appropriate variants for context:
  - \`primary\`: Main actions
  - \`secondary\`: Alternative actions
  - \`outline\`: Less prominent actions
- Maintain consistent sizing within context
- Provide loading feedback for async actions
- Consider mobile touch targets (min 44x44px)
- Use appropriate ARIA labels when needed

### Usage Guidelines
\`\`\`tsx
// Basic usage
<Button>Click Me</Button>

// With variant and size
<Button variant="primary" size="lg">Large Primary Button</Button>

// Loading state
<Button loading>Processing...</Button>

// With ARIA label
<Button aria-label="Close dialog">✕</Button>

// Full width on mobile
<Button fullWidth>Submit</Button>
\`\`\`
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};
