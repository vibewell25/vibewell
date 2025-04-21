import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
import { Button } from '../base/Button/Button';

const meta = {
  title: 'Components/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card component that can be used to group related content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'elevated'],
      description: 'The visual style variant of the card',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'The padding size of the card',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'The size of the card',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'The border radius of the card',
    },
    isHoverable: {
      control: 'boolean',
      description: 'Whether the card has hover effects',
    },
    isClickable: {
      control: 'boolean',
      description: 'Whether the card is clickable',
    },
    isCollapsible: {
      control: 'boolean',
      description: 'Whether the card can be collapsed',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
    </Card>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card isClickable isHoverable>
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>This card has hover and click effects</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Click or hover over this card to see the effects</p>
      </CardContent>
    </Card>
  ),
};

export const Collapsible: Story = {
  render: () => (
    <Card isCollapsible>
      <CardHeader>
        <CardTitle>Collapsible Card</CardTitle>
        <CardDescription>Click the arrow to collapse/expand</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This content can be collapsed</p>
      </CardContent>
    </Card>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card with Actions</CardTitle>
        <CardDescription>A card with interactive buttons</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card contains action buttons in the footer</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
      <CardHeader>
        <CardTitle>Custom Styled Card</CardTitle>
        <CardDescription className="text-white/80">With gradient background</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has custom styling applied</p>
      </CardContent>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default Variant</CardTitle>
        </CardHeader>
        <CardContent>Default card style</CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Outline Variant</CardTitle>
        </CardHeader>
        <CardContent>Outlined card style</CardContent>
      </Card>

      <Card variant="ghost">
        <CardHeader>
          <CardTitle>Ghost Variant</CardTitle>
        </CardHeader>
        <CardContent>Ghost card style</CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Variant</CardTitle>
        </CardHeader>
        <CardContent>Elevated card style</CardContent>
      </Card>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Small Card</CardTitle>
        </CardHeader>
        <CardContent>Small size card</CardContent>
      </Card>

      <Card size="md">
        <CardHeader>
          <CardTitle>Medium Card</CardTitle>
        </CardHeader>
        <CardContent>Medium size card</CardContent>
      </Card>

      <Card size="lg">
        <CardHeader>
          <CardTitle>Large Card</CardTitle>
        </CardHeader>
        <CardContent>Large size card</CardContent>
      </Card>

      <Card size="xl">
        <CardHeader>
          <CardTitle>Extra Large Card</CardTitle>
        </CardHeader>
        <CardContent>Extra large size card</CardContent>
      </Card>
    </div>
  ),
};

export const NestedCards: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Parent Card</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Nested Card 1</CardTitle>
          </CardHeader>
          <CardContent>First nested card</CardContent>
        </Card>
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Nested Card 2</CardTitle>
          </CardHeader>
          <CardContent>Second nested card</CardContent>
        </Card>
      </CardContent>
    </Card>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
        <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 animate-pulse rounded" />
          <div className="h-3 bg-gray-100 animate-pulse rounded" />
          <div className="h-3 bg-gray-100 animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  ),
};
