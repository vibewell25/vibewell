# VibeWell Responsive Design Guide

## Overview

This guide outlines the responsive design approach for the VibeWell platform to ensure a consistent and optimized experience across web and mobile interfaces. It provides standards, best practices, and implementation examples to help maintain a cohesive user experience regardless of device.

## Table of Contents

1. [Responsive Design Principles](#responsive-design-principles)
2. [Breakpoints](#breakpoints)
3. [Layout Guidelines](#layout-guidelines)
4. [Component Adaptations](#component-adaptations)
5. [Touch Interactions](#touch-interactions)
6. [Performance Considerations](#performance-considerations)
7. [Testing Checklist](#testing-checklist)
8. [Responsive Utilities](#responsive-utilities)

## Responsive Design Principles

### Mobile-First Approach

The VibeWell platform follows a mobile-first design approach. This means:

- Design for mobile screens first, then enhance for larger screens
- Focus on core content and functionality first
- Add progressive enhancements for tablet and desktop views
- Ensure critical paths work even on low-end devices

### Content Priorities

- Essential content and actions must be immediately accessible
- Secondary content can be revealed progressively
- Maintain proper information hierarchy across all device sizes

### Consistent Experience

- Core functionality should be available on all device types
- Experience should be familiar across devices for the same user
- Design patterns should remain consistent

## Breakpoints

VibeWell uses the following breakpoints, based on common device screen sizes:

| Name | Size (px) | Typical Devices |
|------|-----------|-----------------|
| xs   | 0+        | Small phones    |
| sm   | 640+      | Large phones    |
| md   | 768+      | Tablets         |
| lg   | 1024+     | Laptops         |
| xl   | 1280+     | Desktops        |
| 2xl  | 1536+     | Large desktops  |

### Usage in Tailwind CSS

Example usage in component classes:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* This creates a single column layout on mobile, 2 columns on tablets, 
      and 4 columns on desktop */}
</div>
```

### Usage with the Responsive Hook

```jsx
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div>
      {isMobile && <SimplifiedView />}
      {isTablet && <EnhancedView />}
      {isDesktop && <FullFeaturedView />}
    </div>
  );
}
```

## Layout Guidelines

### Container Widths

Use the `ResponsiveContainer` component to maintain consistent container widths:

```jsx
<ResponsiveContainer maxWidth="lg">
  {/* Content here */}
</ResponsiveContainer>
```

### Grid System

- Use CSS Grid for two-dimensional layouts
- Use Flexbox for one-dimensional layouts
- Maintain consistent gutters (gap spacing) using the gap utilities
- Nested grids should follow the same gap pattern for consistency

### Spacing and Scaling

- Use relative units (rem, em) rather than fixed pixels for text and spacing
- Scale headings and key UI elements proportionally across devices
- Maintain sufficient touch targets (min 44x44px) for interactive elements

## Component Adaptations

### Navigation

- Desktop: Full horizontal menu
- Tablet: Condensed horizontal menu or hamburger menu
- Mobile: Hamburger menu with slide-in panel

### Forms

- Stack form fields vertically on mobile
- Group related fields on larger screens
- Ensure proper input sizing for touch devices
- Use appropriate keyboard types on mobile

### Tables

- On mobile, consider alternative presentations:
  - Cards
  - Collapsible rows
  - Horizontal scrolling with fixed columns
  - Responsive tables with data-attributes

### Images

Use the `ResponsiveImage` component to optimize image loading and display:

```jsx
<ResponsiveImage
  src="/images/hero-desktop.jpg"
  mobileSrc="/images/hero-mobile.jpg"
  tabletSrc="/images/hero-tablet.jpg"
  alt="Hero image"
  width={1200}
  height={800}
/>
```

## Touch Interactions

### Gesture Support

Use the `TouchHandler` component to add gesture support to interactive elements:

```jsx
<TouchHandler
  onSwipe={(direction, distance) => console.log(`Swiped ${direction}`)}
  onPinch={(scale) => console.log(`Pinched with scale ${scale}`)}
  onTap={(position) => console.log(`Tapped at ${position.x}, ${position.y}`)}
>
  <div className="interactive-element">
    Content with gesture support
  </div>
</TouchHandler>
```

### Touch Targets

- Ensure all interactive elements have a minimum touch target size of 44x44px
- Maintain adequate spacing between touch targets (min 8px)
- Use appropriate affordances (e.g., shadows, hover states) to indicate interactivity

## Performance Considerations

### Image Optimization

- Serve appropriately sized images based on device
- Use modern image formats (WebP, AVIF) with fallbacks
- Implement lazy loading for offscreen images
- Consider critical images for preloading

### Rendering Optimization

- Minimize layout shifts during loading
- Use content placeholders during loading (skeleton loaders)
- Implement virtual scrolling for long lists
- Debounce resize handlers and other expensive operations

### Network Considerations

- Optimize initial payload size for mobile networks
- Implement progressive enhancement
- Detect network conditions and adapt experience accordingly

## Testing Checklist

- [ ] Test on actual devices, not just browser emulations
- [ ] Verify functionality across all breakpoints
- [ ] Test touch interactions on real touch devices
- [ ] Ensure forms work properly on mobile keyboards
- [ ] Check performance on low-end devices
- [ ] Verify viewport settings and meta tags
- [ ] Test across different browsers
- [ ] Validate with automated accessibility tools
- [ ] Check font legibility across device sizes

## Responsive Utilities

VibeWell provides several utilities to assist with responsive design:

### useResponsive Hook

```jsx
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const { 
    deviceType,   // 'mobile', 'tablet', or 'desktop'
    dimensions,   // Current viewport dimensions
    isMobile,     // Boolean flag for mobile
    isTablet,     // Boolean flag for tablet
    isDesktop,    // Boolean flag for desktop
    isTouch,      // Boolean flag for touch devices
    isBreakpoint, // Function to check specific breakpoints
  } = useResponsive();
  
  // Example usage
  if (isBreakpoint('md', 'down')) {
    // Code for screens smaller than md breakpoint
  }
  
  return (
    <div>
      {deviceType === 'mobile' && <MobileView />}
      {deviceType === 'tablet' && <TabletView />}
      {deviceType === 'desktop' && <DesktopView />}
    </div>
  );
}
```

### ResponsiveTester Component

During development, you can use the ResponsiveTester component to visualize responsive behavior:

```jsx
<ResponsiveTester position="bottom-right" />
```

This adds a floating panel showing:
- Current viewport dimensions
- Device type detection
- Active breakpoint
- Touch event information

### Testing Page

Visit the `/test/responsive` route to see examples of responsive components and test their behavior on different devices.

---

## Final Notes

- Always maintain accessibility across all device sizes
- Use the responsive tools and components consistently throughout the application
- Regularly test on actual devices, not just browser emulations
- Consult this guide when creating new components or pages

By following these guidelines, we ensure that the VibeWell platform provides an optimal experience for all users, regardless of their device. 