# Component Documentation Style Guide

This guide provides standards for documenting components in the Vibewell project. Consistent documentation improves code maintainability and developer onboarding.

## Documentation Format

We use JSDoc for documenting components. Each component file should include a documentation block at the top with the following structure:

```tsx
/**
 * ComponentName Component
 * 
 * Description: A clear, concise description of what the component does and when to use it.
 * 
 * @component
 * 
 * @typedef ComponentNameProps
 * @param {string} propName - Description of what this prop does
 * @param {number} anotherProp - Description of another prop
 * 
 * @example
 * ```tsx
 * <ComponentName propName="value" anotherProp={42} />
 * ```
 */
```

## Required Sections

1. **Component Name**: The first line should be the component name followed by "Component".
2. **Description**: Explain what the component does, its purpose, and when to use it.
3. **Component Tag**: Include `@component` to mark it as a component.
4. **Props Type Definition**: Document the props interface with `@typedef`.
5. **Props Documentation**: Document each prop with `@param` tags.
6. **Example**: Provide at least one usage example.

## Optional Sections

1. **See Also**: Reference related components with `@see`.
2. **Since**: Version when the component was introduced with `@since`.
3. **Deprecated**: If applicable, mark as deprecated with `@deprecated`.

## Style Guidelines

1. **Be Concise**: Keep descriptions clear and to the point.
2. **Be Complete**: Document all props, including optional ones.
3. **Indicate Required/Optional**: For each prop, indicate if it's required or optional.
4. **Show Defaults**: Document default values for optional props.
5. **Provide Examples**: Include meaningful examples that demonstrate main use cases.

## Documenting Prop Types

| Type | Format |
|------|--------|
| String | `{string}` |
| Number | `{number}` |
| Boolean | `{boolean}` |
| Function | `{(param1: type, param2: type) => returnType}` |
| Object | `{Object.<keyType, valueType>}` or `{Record<keyType, valueType>}` |
| Array | `{Array.<elementType>}` or `{elementType[]}` |
| Union Types | `{string\|number}` |
| Specific Values | `{'value1'\|'value2'}` |

## Automated Documentation

We have a script to help with documentation:

```bash
# Generate documentation for a specific component
node scripts/generate-component-docs.js --component Button

# Validate documentation for a directory
node scripts/generate-component-docs.js --validate src/components/ui

# Fix missing documentation in a directory
node scripts/generate-component-docs.js --validate src/components/ui --fix
```

## Examples

### Basic Component

```tsx
/**
 * Button Component
 * 
 * Description: A customizable button component that supports different variants and sizes.
 * 
 * @component
 * 
 * @typedef ButtonProps
 * @param {string} label - The text to display inside the button
 * @param {'primary'|'secondary'|'outline'} variant - (optional) Button style variant (default: 'primary')
 * @param {'sm'|'md'|'lg'} size - (optional) Button size (default: 'md')
 * @param {boolean} disabled - (optional) Whether the button is disabled (default: false)
 * @param {() => void} onClick - Function to call when button is clicked
 * 
 * @example
 * ```tsx
 * <Button
 *   label="Submit"
 *   variant="primary"
 *   size="md"
 *   onClick={() => console.log('Button clicked')}
 * />
 * ```
 */
```

### Complex Component

```tsx
/**
 * DataTable Component
 * 
 * Description: A flexible data table component that supports sorting, filtering, and pagination.
 * 
 * @component
 * 
 * @typedef ColumnDefinition
 * @property {string} key - Unique identifier for the column
 * @property {string} label - Display name for the column
 * @property {boolean} sortable - (optional) Whether the column is sortable (default: false)
 * @property {(value: any) => React.ReactNode} render - (optional) Custom render function
 * 
 * @typedef DataTableProps
 * @param {Array.<Object>} data - The data to display in the table
 * @param {Array.<ColumnDefinition>} columns - Column definitions
 * @param {boolean} paginated - (optional) Whether to show pagination controls (default: true)
 * @param {number} pageSize - (optional) Number of rows per page (default: 10)
 * @param {(data: Array.<Object>) => void} onRowSelect - (optional) Callback when rows are selected
 * 
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Role', render: (role) => <Badge>{role}</Badge> }
 *   ]}
 *   paginated={true}
 *   pageSize={15}
 *   onRowSelect={setSelectedUsers}
 * />
 * ```
 * 
 * @see Pagination
 * @see SortableHeader
 */
``` 