import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
from '../components/ui/form';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
),
  email: z.string().email({
    message: 'Please enter a valid email address.',
),
const FormDemo = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
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
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
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
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormDescription>We'll never share your email with anyone else.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
const meta = {
  title: 'Components/Form',
  component: FormDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Form Component

A flexible form component built with React Hook Form and Zod validation.

### Features
- Built on top of React Hook Form
- Zod schema validation
- Accessible form controls
- Built-in error handling
- Form field descriptions
- Customizable styling

### Accessibility
- Proper label associations
- Error message announcements
- Descriptive help text
- Keyboard navigation support
- ARIA attributes for form controls

### Best Practices
- Use clear and concise labels
- Provide helpful descriptions
- Show validation errors inline
- Group related fields
- Use appropriate input types
- Maintain consistent styling

### Usage
\`\`\`tsx
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
from '@/components/ui/form';
import { Input } from '@/components/ui/Input';

const formSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
function onSubmit(values) {
    console.log(values);
return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Add more form fields */}
      </form>
    </Form>
\`\`\`
`,
tags: ['autodocs'],
satisfies Meta<typeof FormDemo>;

export default meta;
type Story = StoryObj<typeof FormDemo>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default form with validation and error handling.',
export const WithErrors = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: 'invalid-email',
return (
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
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
                  <Input placeholder="Enter your email" type="email" {...field} />
                </FormControl>
                <FormDescription>We'll never share your email with anyone else.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
parameters: {
    docs: {
      description: {
        story: 'Form with pre-filled invalid data to demonstrate error states.',
