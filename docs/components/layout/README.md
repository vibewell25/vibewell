# Layout Components

## Overview
Layout components provide the structural foundation for the Vibewell application, handling responsive design, spacing, and content organization.

## Components

### AppLayout
The main application layout wrapper.

```typescript
import { AppLayout } from '@vibewell/components';

<AppLayout
  sidebar={<Sidebar />}
  header={<Header />}
  footer={<Footer />}
>
  {children}
</AppLayout>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | `ReactNode` | Yes | Main content |
| sidebar | `ReactNode` | No | Sidebar component |
| header | `ReactNode` | No | Header component |
| footer | `ReactNode` | No | Footer component |
| className | `string` | No | Additional CSS classes |

### Container
A responsive container component that centers content and maintains consistent margins.

```typescript
import { Container } from '@vibewell/components';

<Container maxWidth="lg" padding="md">
  {children}
</Container>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | `ReactNode` | Yes | Container content |
| maxWidth | `'sm' \| 'md' \| 'lg' \| 'xl'` | No | Maximum width |
| padding | `'sm' \| 'md' \| 'lg'` | No | Padding size |
| fluid | `boolean` | No | Full-width mode |

### Grid
A flexible grid system for creating responsive layouts.

```typescript
import { Grid, GridItem } from '@vibewell/components';

<Grid columns={12} spacing="md">
  <GridItem span={6}>Column 1</GridItem>
  <GridItem span={6}>Column 2</GridItem>
</Grid>
```

#### Grid Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | `ReactNode` | Yes | Grid items |
| columns | `number` | No | Number of columns |
| spacing | `'sm' \| 'md' \| 'lg'` | No | Gap between items |
| alignItems | `'start' \| 'center' \| 'end'` | No | Vertical alignment |

#### GridItem Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | `ReactNode` | Yes | Item content |
| span | `number` | No | Columns to span |
| offset | `number` | No | Column offset |
| order | `number` | No | Item order |

### Stack
Vertical or horizontal stack with consistent spacing.

```typescript
import { Stack } from '@vibewell/components';

<Stack direction="vertical" spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | `ReactNode` | Yes | Stack items |
| direction | `'vertical' \| 'horizontal'` | No | Stack direction |
| spacing | `'sm' \| 'md' \| 'lg'` | No | Gap between items |
| align | `'start' \| 'center' \| 'end'` | No | Item alignment |

## Best Practices

### Responsive Design
1. Use relative units (rem, em) for spacing
2. Implement mobile-first design approach
3. Test layouts across different screen sizes
4. Use breakpoints consistently
5. Avoid fixed dimensions where possible

### Performance
1. Minimize nested layouts
2. Use CSS Grid and Flexbox efficiently
3. Implement virtualization for long lists
4. Optimize for content reflow
5. Consider layout shift metrics

### Accessibility
1. Maintain proper heading hierarchy
2. Ensure sufficient color contrast
3. Provide skip links for navigation
4. Use semantic HTML elements
5. Support keyboard navigation

## Examples

### Responsive Dashboard Layout
```typescript
import { AppLayout, Container, Grid, GridItem } from '@vibewell/components';

function DashboardLayout() {
  return (
    <AppLayout
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <Container maxWidth="xl" padding="lg">
        <Grid columns={12} spacing="md">
          <GridItem span={12} md={8}>
            <MainContent />
          </GridItem>
          <GridItem span={12} md={4}>
            <Sidebar />
          </GridItem>
        </Grid>
      </Container>
    </AppLayout>
  );
}
```

### Card Grid Layout
```typescript
import { Grid, GridItem, Card } from '@vibewell/components';

function CardGrid({ items }) {
  return (
    <Grid columns={12} spacing="md">
      {items.map(item => (
        <GridItem key={item.id} span={12} sm={6} md={4} lg={3}>
          <Card>
            <Card.Image src={item.image} />
            <Card.Content>
              <Card.Title>{item.title}</Card.Title>
              <Card.Text>{item.description}</Card.Text>
            </Card.Content>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
} 