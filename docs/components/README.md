# Vibewell UI Component Library

This document provides an overview of the UI components available in the Vibewell application.

## Contents
- [Introduction](#introduction)
- [Component Categories](#component-categories)
- [Usage Guidelines](#usage-guidelines)
- [Component List](#component-list)
  - [Basic UI Components](#basic-ui-components)
  - [Form Components](#form-components)
  - [Layout Components](#layout-components)
  - [Navigation Components](#navigation-components)
  - [Feedback Components](#feedback-components)
  - [AR Components](#ar-components)

## Introduction

The Vibewell UI component library provides a collection of reusable, accessible, and responsive components designed to create a consistent user experience across the application. These components are built using React, TypeScript, and Tailwind CSS.

## Component Categories

Components are organized into the following categories:

1. **Basic UI Components**: Fundamental building blocks like buttons, cards, and avatars
2. **Form Components**: Components for user input like forms, inputs, and select menus
3. **Layout Components**: Components for page structure like containers and grids
4. **Navigation Components**: Components for user navigation like menus and breadcrumbs
5. **Feedback Components**: Components for user feedback like alerts and toasts
6. **AR Components**: Components for augmented reality features

## Usage Guidelines

### Importing Components

Components can be imported directly from their respective modules:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

### Accessibility

All components are designed with accessibility in mind. They include appropriate ARIA attributes and support keyboard navigation. Always provide alternative text for images and descriptive labels for interactive elements.

### Responsiveness

Components are responsive by default. They will adapt to different screen sizes. You can use Tailwind CSS classes to further customize their behavior on different devices.

## Component List

### Basic UI Components

#### Avatar

The Avatar component is used to represent a user or entity.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Basic usage
<Avatar>
  <AvatarImage src="https://example.com/user.jpg" alt="User Name" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>

// Different sizes
<Avatar size="xs">...</Avatar>
<Avatar size="sm">...</Avatar>
<Avatar size="md">...</Avatar>
<Avatar size="lg">...</Avatar>
<Avatar size="xl">...</Avatar>
<Avatar size="2xl">...</Avatar>
```

**Props:**
- `size`: Controls the size of the avatar ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl')
- `className`: Additional CSS classes

#### Button

The Button component is used for actions and submissions.

```tsx
import { Button } from "@/components/ui/button";

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Disabled
<Button disabled>Disabled</Button>
```

**Props:**
- `variant`: Appearance style ('primary' | 'secondary' | 'outline' | 'ghost')
- `size`: Size of the button ('sm' | 'md' | 'lg')
- `asChild`: When true, the component will render its child
- `disabled`: Whether the button is disabled

#### Card

The Card component is used for displaying content in a boxed format.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props:**
- `className`: Additional CSS classes

### Form Components

#### Form

The Form component provides validation and submission handling.

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema
const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});

// Usage example
function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  function onSubmit(values) {
    console.log(values);
  }

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
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormDescription>
                Your display name.
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
```

#### DateTimePicker

The DateTimePicker component allows users to select both a date and time.

```tsx
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useState } from "react";

function DatePickerExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return <DateTimePicker date={date} setDate={setDate} />;
}
```

**Props:**
- `date`: The selected date and time
- `setDate`: Function to update the selected date and time
- `disabled`: Whether the picker is disabled

#### Select

The Select component provides a dropdown of options.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value="apple" onValueChange={(value) => console.log(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

### Layout Components

#### Container

The Container component provides a responsive container with consistent padding.

```tsx
import { Container } from "@/components/ui/container";

<Container>
  <p>Content with consistent margins</p>
</Container>
```

#### Grid

The Grid component provides a responsive grid layout.

```tsx
import { Grid } from "@/components/ui/grid";

<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

### Navigation Components

#### Breadcrumb

The Breadcrumb component shows the user's current location in a hierarchical structure.

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem isCurrentPage>
    <BreadcrumbLink href="/products/item">Item</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>
```

### Feedback Components

#### Alert

The Alert component is used to display important messages to the user.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

<Alert>
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational message.
  </AlertDescription>
</Alert>

// Different variants
<Alert variant="success">...</Alert>
<Alert variant="warning">...</Alert>
<Alert variant="error">...</Alert>
```

#### Toast

The Toast component displays brief notifications.

```tsx
import { useToast } from "@/components/ui/use-toast";

function ToastExample() {
  const { toast } = useToast();
  
  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled",
          description: "Your appointment has been scheduled.",
        });
      }}
    >
      Show Toast
    </Button>
  );
}
```

### AR Components

#### ARViewer

The ARViewer component displays 3D models in augmented reality.

```tsx
import { ARViewer } from "@/components/ar/ar-viewer";

<ARViewer modelUrl="https://example.com/model.glb" type="makeup" />
```

**Props:**
- `modelUrl`: URL to the 3D model file
- `type`: Type of AR experience ('makeup' | 'jewelry' | 'furniture' | 'clothing')
- `placeholder`: URL to a placeholder image while the model loads

For more detailed documentation on each component, refer to the individual component documentation files in the `docs/components/` directory. 