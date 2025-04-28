# Icon Standardization Migration Plan

This document outlines the plan for standardizing icon usage across the VibeWell platform.

## Completed Tasks

1. ✅ Created a centralized `Icons` component that provides:
   - All heroicons (outline and solid variants)
   - Consistent sizing props
   - Custom icons (logo, social, etc.)
   
2. ✅ Updated key components to use the centralized Icons:
   - ThemeToggle
   - ThemeSelector
   - NotificationIndicator
   - MobileLayout
   
3. ✅ Fixed type definitions and enhanced component structure.

## Components to Update

Based on the grep search for direct heroicon imports, the following components need to be updated:

### High Priority (Core UI Components)

1. Header components
2. Button components with icons
3. Form components with icons
4. Navigation components

### Component List

```
src/components/recommended-connections.tsx
src/components/event-groups-networking.tsx
src/components/event-recommendations.tsx
src/components/hub-search.tsx
src/components/resource-detail-template.tsx
src/components/event-analytics-integrations.tsx
src/components/message-notification-badge.tsx
src/components/events-calendar.tsx
src/components/event-reminders.tsx
src/components/event-analytics.tsx
src/components/resource-review.tsx
src/components/event-checkin-feedback.tsx
src/components/notifications/NotificationCenter.tsx
src/components/notifications/NotificationButton.tsx
src/components/notifications/NotificationList.tsx
src/components/beauty/UpcomingAppointments.tsx
src/components/share-post.tsx
src/components/beauty/BeautyContentModal.tsx
src/components/enhanced-header.tsx
src/components/content-calendar/content-calendar-sidebar.tsx
src/components/client-acquisition-nav.tsx
src/components/community-events-section.tsx
src/components/RatingBreakdown.tsx
src/components/common/Dropdown.tsx
src/components/common/SearchInput.tsx
src/components/notification-badge.tsx
src/components/event-management.tsx
src/components/common/Modal.tsx
src/components/common/Notification.tsx
src/components/common/FileUpload.tsx
src/components/common/Accordion.tsx
src/components/common/Pagination.tsx
src/components/ReviewForm.tsx
src/components/event-materials-agenda.tsx
src/components/dashboard/UpcomingAppointments.tsx
src/components/event-share-card.tsx
src/components/common/Breadcrumbs.tsx
src/components/common/SearchBar.tsx
src/components/business/InventoryManagement.tsx
src/components/business/AnalyticsDashboard.tsx
src/components/business/BusinessList.tsx
src/components/ReviewCard.tsx
src/components/rewards/LoyaltyPointsCard.tsx
src/components/rewards/LoyaltyTransactions.tsx
src/components/rewards/LoyaltyPoints.tsx
src/components/business/BusinessDirectory.tsx
src/components/business-hub-mobile-nav.tsx
src/components/business-hub-navigation.tsx
src/components/star-rating.tsx
src/components/dashboard/ActivityFeed.tsx
src/components/marketing-nav.tsx
src/components/top-rated-resources.tsx
src/components/wellness/GoalProgressCard.tsx
src/components/wellness/ContentActions.tsx
src/components/wellness/DeleteConfirmationModal.tsx
src/components/wellness/ProgressSummaryCard.tsx
src/components/wellness/GoalList.tsx
src/components/wellness/WellnessContentModal.tsx
src/components/wellness/ContentFilter.tsx
src/components/messaging.tsx
src/components/wellness/GoalCreationModal.tsx
src/components/user-avatar.tsx
src/components/financial-nav.tsx
src/components/business-hub-sidebar.tsx
src/components/premium-content-lock.tsx
```

## Migration Process

For each component:

1. Import the Icons component: `import { Icons } from '@/components/icons';`
2. Remove direct heroicon imports
3. Replace icon usage:
   - From: `<SunIcon className="h-5 w-5" />`
   - To: `<Icons.SunIcon className="h-5 w-5" />`
4. For solid icons, use the naming convention with "Solid" suffix:
   - From: `<StarIcon className="h-5 w-5" />` (from solid import)
   - To: `<Icons.StarSolid className="h-5 w-5" />`

## Testing

After migration:
1. Run TypeScript checks: `npm run type-check`
2. Run linter: `npm run lint`
3. Visually verify key components render correctly
4. Run component tests: `npm test`

## CI/CD Integration

Add the following checks to the CI pipeline:

```yaml
- name: Check for direct heroicon imports
  run: |
    ! grep -r "from '@heroicons/react" --include="*.tsx" src/components
```

This will ensure no new direct imports are added to components. 