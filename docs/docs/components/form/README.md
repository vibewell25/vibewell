# Form Components

## Overview
Form components provide a consistent and accessible way to collect user input in the VibeWell application.

## Components

### TextField
A text input component with built-in validation and error handling.

```typescript
import { TextField } from '@vibewell/components';

<TextField
  label="Email"
  name="email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  onChange={handleChange}
/>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | `string` | Yes | Input label |
| name | `string` | Yes | Field name |
| type | `'text' \| 'email' \| 'password' \| 'number'` | No | Input type |
| value | `string` | No | Input value |
| onChange | `(value: string) => void` | Yes | Change handler |
| error | `string` | No | Error message |
| placeholder | `string` | No | Placeholder text |
| disabled | `boolean` | No | Disabled state |

### Select
A dropdown select component with support for single and multiple selection.

```typescript
import { Select } from '@vibewell/components';

<Select
  label="Country"
  name="country"
  options={countries}
  value={selectedCountry}
  onChange={handleCountryChange}
/>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | `string` | Yes | Select label |
| name | `string` | Yes | Field name |
| options | `Array<Option>` | Yes | Select options |
| value | `string \| string[]` | No | Selected value(s) |
| onChange | `(value: string \| string[]) => void` | Yes | Change handler |
| multiple | `boolean` | No | Multiple selection |
| error | `string` | No | Error message |
| disabled | `boolean` | No | Disabled state |

### Checkbox
A checkbox component for boolean or multiple selection inputs.

```typescript
import { Checkbox } from '@vibewell/components';

<Checkbox
  label="Accept terms"
  name="terms"
  checked={accepted}
  onChange={handleChange}
/>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | `string` | Yes | Checkbox label |
| name | `string` | Yes | Field name |
| checked | `boolean` | No | Checked state |
| onChange | `(checked: boolean) => void` | Yes | Change handler |
| error | `string` | No | Error message |
| disabled | `boolean` | No | Disabled state |

### Form
A form wrapper component that handles form state and validation.

```typescript
import { Form } from '@vibewell/components';

<Form
  initialValues={initialData}
  validationSchema={schema}
  onSubmit={handleSubmit}
>
  {({ values, errors, handleChange }) => (
    <>
      <TextField
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Button type="submit">Submit</Button>
    </>
  )}
</Form>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | `FormRenderProps => ReactNode` | Yes | Form render function |
| initialValues | `object` | Yes | Initial form values |
| validationSchema | `object` | No | Yup validation schema |
| onSubmit | `(values: object) => void` | Yes | Submit handler |
| onChange | `(values: object) => void` | No | Change handler |

## Best Practices

### Validation
1. Use Yup for schema validation
2. Provide immediate feedback
3. Show clear error messages
4. Validate on blur and submit
5. Support custom validation rules

### Accessibility
1. Use proper ARIA attributes
2. Maintain focus management
3. Support keyboard navigation
4. Provide error announcements
5. Use semantic HTML elements

### User Experience
1. Preserve form state
2. Show loading indicators
3. Prevent double submission
4. Support auto-complete
5. Implement proper error recovery

## Examples

### Registration Form
```typescript
import { Form, TextField, Select, Checkbox, Button } from '@vibewell/components';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  country: Yup.string()
    .required('Country is required'),
  terms: Yup.boolean()
    .oneOf([true], 'Must accept terms')
});

function RegistrationForm() {
  const handleSubmit = async (values) => {
    try {
      await registerUser(values);
      showSuccess('Registration successful');
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <Form
      initialValues={{
        email: '',
        password: '',
        country: '',
        terms: false
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, handleChange, isSubmitting }) => (
        <Stack spacing="md">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Select
            label="Country"
            name="country"
            options={countries}
            value={values.country}
            onChange={handleChange}
            error={errors.country}
          />
          <Checkbox
            label="I accept the terms and conditions"
            name="terms"
            checked={values.terms}
            onChange={handleChange}
            error={errors.terms}
          />
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Register
          </Button>
        </Stack>
      )}
    </Form>
  );
} 