import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
from '../components/ui/select';

const SelectDemo = () => {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
          <SelectItem value="pear">Pear</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
const meta = {
  title: 'Components/Select',
  component: SelectDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Select Component

A customizable select component built with Radix UI primitives.

### Features
- Accessible by default
- Custom styling support
- Keyboard navigation
- Customizable trigger and items
- Support for option groups
- Placeholder text
- Disabled states

### Accessibility
- WAI-ARIA compliant
- Keyboard navigation support
- Screen reader announcements
- Focus management
- ARIA attributes and roles

### Best Practices
- Use clear and concise option labels
- Group related options when needed
- Provide meaningful placeholder text
- Maintain consistent styling
- Consider mobile usability
- Handle empty states

### Usage
\`\`\`tsx
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
from '@/components/ui/select';

function MyComponent() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
\`\`\`
`,
tags: ['autodocs'],
satisfies Meta<typeof SelectDemo>;

export default meta;
type Story = StoryObj<typeof SelectDemo>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default select component with a list of options.',
export const WithGroups = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a food" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="group-title" disabled>
            Fruits
          </SelectItem>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectItem value="group-title-2" disabled>
            Vegetables
          </SelectItem>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with grouped options.',
export const Disabled = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled select component.',
export const WithDisabledOptions = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2" disabled>
            Option 2 (Disabled)
          </SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
          <SelectItem value="option4" disabled>
            Option 4 (Disabled)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with some disabled options.',
export const CustomTrigger = {
  render: () => (
    <Select>
      <SelectTrigger className="bg-primary text-primary-foreground w-[180px]">
        <SelectValue placeholder="Custom style" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with custom trigger styling.',
