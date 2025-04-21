import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Card, CardProps } from '../components/Card';

export default {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'flat'],
      description: 'The visual style variant of the card',
    },
    clickable: {
      control: 'boolean',
      description: 'Whether the card is interactive',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a loading skeleton state',
    },
    responsive: {
      control: 'boolean',
      description: 'Enables responsive width behavior',
    },
  },
  parameters: {
    componentSubtitle: 'A versatile container component for grouping related content',
    docs: {
      description: {
        component: `
### Overview
The Card component is a flexible container that groups related content and actions.
It supports various visual styles, interactive states, and responsive behaviors.

### Accessibility
- Uses semantic HTML structure
- Supports keyboard navigation when clickable
- Includes proper ARIA attributes
- Maintains color contrast ratios
- Provides focus indicators

### Best Practices
- Use cards to group related content
- Keep content hierarchy consistent
- Avoid nesting cards
- Use appropriate variant for context
- Consider mobile viewports
        `,
      },
    },
  },
} as Meta<typeof Card>;

const Template: StoryFn<CardProps> = (args: CardProps) => <Card {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: (
    <>
      <Card.Header>Card Header</Card.Header>
      <Card.Body>Card Content</Card.Body>
      <Card.Footer>Card Footer</Card.Footer>
    </>
  ),
};

export const WithImage = Template.bind({});
WithImage.args = {
  children: (
    <>
      <Card.Image src="https://source.unsplash.com/random/800x400" alt="Random image" />
      <Card.Body>
        <h3 className="text-xl font-semibold mb-2">Card with Image</h3>
        <p>This card includes an image at the top.</p>
      </Card.Body>
    </>
  ),
};

export const Interactive = Template.bind({});
Interactive.args = {
  clickable: true,
  onClick: () => alert('Card clicked!'),
  children: (
    <Card.Body>
      <h3 className="text-xl font-semibold mb-2">Clickable Card</h3>
      <p>Click me to trigger an action!</p>
    </Card.Body>
  ),
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
  children: (
    <>
      <Card.Header>This content is hidden while loading</Card.Header>
      <Card.Body>Loading state shows a skeleton instead</Card.Body>
    </>
  ),
};

export const Variants = () => (
  <div className="space-y-4">
    <Card variant="elevated">
      <Card.Body>Elevated Card</Card.Body>
    </Card>
    <Card variant="outlined">
      <Card.Body>Outlined Card</Card.Body>
    </Card>
    <Card variant="flat">
      <Card.Body>Flat Card</Card.Body>
    </Card>
  </div>
);

export const ComplexContent = Template.bind({});
ComplexContent.args = {
  children: (
    <>
      <Card.Header>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Complex Layout</h3>
          <button className="text-primary-500">⋮</button>
        </div>
      </Card.Header>
      <Card.Image src="https://source.unsplash.com/random/800x400" alt="Random image" />
      <Card.Body>
        <div className="space-y-4">
          <p>This card demonstrates a more complex content layout.</p>
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              Tag 1
            </span>
            <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              Tag 2
            </span>
          </div>
        </div>
      </Card.Body>
      <Card.Footer>
        <div className="flex justify-between items-center">
          <button className="text-primary-500">Learn More</button>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded">👍</button>
            <button className="p-2 hover:bg-gray-100 rounded">💬</button>
            <button className="p-2 hover:bg-gray-100 rounded">Share</button>
          </div>
        </div>
      </Card.Footer>
    </>
  ),
};
