import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Alert Component

A component for displaying important messages, notifications, or feedback to users.

### Features
- Multiple variants for different types of alerts (default, destructive)
- Support for custom icons
- Accessible by default
- Responsive design

### Accessibility
- Uses appropriate ARIA roles and attributes
- Color combinations meet WCAG contrast requirements
- Keyboard navigation support
- Screen reader announcements

### Best Practices
- Use appropriate variants for different message types
- Keep messages clear and concise
- Include actionable information when needed
- Position alerts where they'll be noticed but not intrusive

### Usage
\`\`\`tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function MyComponent() {
  return (
    <Alert>
      <AlertTitle>Important Message</AlertTitle>
      <AlertDescription>
        This is an important message for users.
      </AlertDescription>
    </Alert>
\`\`\`
`,
argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'The visual style of the alert',
      table: {
        defaultValue: { summary: 'default' },
className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
tags: ['autodocs'],
satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>This is a default alert message.</AlertDescription>
      </>
    ),
    variant: 'default',
parameters: {
    docs: {
      description: {
        story: 'Default alert style for general messages.',
export const Destructive: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>
      </>
    ),
    variant: 'destructive',
parameters: {
    docs: {
      description: {
        story: 'Destructive alert style for dangerous actions or critical warnings.',
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <AlertTitle>With Icon</AlertTitle>
        <AlertDescription>This alert includes an icon for better visibility.</AlertDescription>
      </>
    ),
    variant: 'default',
parameters: {
    docs: {
      description: {
        story: 'Alert with a custom icon.',
export const WithActions: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Action Required</AlertTitle>
        <AlertDescription>
          Please take action on this alert.
          <div className="mt-4 flex space-x-4">
            <button className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
              Delete
            </button>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-sm font-medium">
              Cancel
            </button>
          </div>
        </AlertDescription>
      </>
    ),
    variant: 'destructive',
parameters: {
    docs: {
      description: {
        story: 'Alert with action buttons.',
