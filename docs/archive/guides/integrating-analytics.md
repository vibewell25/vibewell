# Integrating Analytics in the VibeWell Platform

This guide explains how to correctly integrate analytics tracking throughout the VibeWell application to ensure consistent data collection and reporting.

## Overview

The VibeWell platform includes a centralized analytics utility that provides standardized interfaces for tracking user behavior, application performance, and business metrics. Using this utility consistently ensures that:

1. All event data follows a standard format
2. Events are appropriately categorized
3. Event tracking works across all environments
4. Data can be easily analyzed to derive insights

## Analytics Utility

The analytics utility is located at `src/utils/analytics.ts` and provides a set of functions for tracking different types of events.

### Basic Usage

```typescript
import { logEvent, trackUserAction, trackPageView } from '../utils/analytics';

// Track a general event
logEvent('button_clicked', {
  buttonId: 'signup-button',
  location: 'header',
  userType: 'anonymous'
});

// Track a user action
trackUserAction('signup_completed', {
  referrer: 'homepage',
  method: 'email',
  timeToComplete: 45 // seconds
});

// Track a page view
trackPageView('/profile', {
  source: 'direct',
  previousPage: '/dashboard'
});
```

## Standard Event Categories

To maintain consistency, use these standard event categories:

### User Actions

These events track intentional user interactions:

```typescript
import { trackUserAction } from '../utils/analytics';

// In a component
const handleSubmit = (formData) => {
  // Process form
  saveData(formData);
  
  // Track the action
  trackUserAction('form_submitted', {
    formId: 'contact-form',
    fields: Object.keys(formData).length,
    timeToComplete: formCompletionTime
  });
};
```

### Page Views

These events track page visits:

```typescript
import { trackPageView } from '../utils/analytics';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Track page view when component mounts
    trackPageView(router.pathname, {
      referrer: document.referrer,
      queryParams: Object.keys(router.query).length
    });
  }, [router.pathname]);
  
  // Rest of component
}
```

### System Events

These events track system-level occurrences:

```typescript
import { logEvent } from '../utils/analytics';

// In your app initialization
const initializeApp = () => {
  checkUserAuth();
  loadInitialData();
  
  // Track app initialization
  logEvent('app_initialized', {
    initialLoadTime: performance.now(),
    isMobile: /Mobi|Android/i.test(navigator.userAgent),
    screenSize: `${window.innerWidth}x${window.innerHeight}`
  });
};
```

### Error Events

These events track errors that occur in the application:

```typescript
import { trackError } from '../utils/analytics';

try {
  await fetchData();
} catch (error) {
  // Track the error
  trackError('data_fetch_failed', {
    errorMessage: error.message,
    endpoint: '/api/data',
    status: error.response?.status
  });
  
  // Handle the error
  showErrorMessage('Failed to fetch data');
}
```

### Performance Events

These events track performance metrics:

```typescript
import { trackPerformance } from '../utils/analytics';
import performanceMonitor from '../utils/performanceMonitor';

// After measuring a performance metric
const measure = performanceMonitor.stopMeasure('api-fetch');
trackPerformance('api_response_time', {
  endpoint: '/api/users',
  duration: measure.duration,
  payloadSize: response.data.length
});
```

## Standardized Event Naming

To ensure consistency in analytics, follow these naming conventions:

### Pattern: `object_action`

```
button_clicked
form_submitted
page_viewed
user_registered
search_performed
modal_opened
```

### Use Snake Case

```
// GOOD
track_user_action('user_profile_updated')

// BAD
track_user_action('userProfileUpdated')
```

### Be Specific But Concise

```
// GOOD
track_user_action('subscription_plan_upgraded')

// TOO GENERAL
track_user_action('upgraded')

// TOO SPECIFIC
track_user_action('user_subscription_plan_upgraded_from_basic_to_premium')
```

## Required Properties for All Events

Certain properties should be included with every event for proper analysis:

```typescript
// The analytics utility automatically adds these:
const standardProperties = {
  timestamp: Date.now(),
  sessionId: getCurrentSessionId(),
  userId: getUserId() || 'anonymous',
  userType: getUserType(),
  appVersion: APP_VERSION,
  environment: process.env.NODE_ENV
};
```

## Event Properties Best Practices

### Include Context

```typescript
// GOOD
trackUserAction('product_added_to_cart', {
  productId: '12345',
  productName: 'Ergonomic Chair',
  productCategory: 'furniture',
  price: 299.99,
  currency: 'USD',
  quantity: 1,
  cartTotal: 299.99
});

// BAD
trackUserAction('product_added', {
  id: '12345'
});
```

### Use Consistent Data Types

```typescript
// GOOD - Consistent numeric values
trackPerformance('page_load_complete', {
  loadTime: 1250, // milliseconds as number
  resourceCount: 32,  // count as number
  imageCount: 8       // count as number
});

// BAD - Mixed types
trackPerformance('page_load_complete', {
  loadTime: '1.25s',  // string instead of number
  resourceCount: '32',  // string instead of number
  imageCount: 8       // number
});
```

### Keep Property Names Consistent

```typescript
// GOOD - Consistent property naming
trackUserAction('search_performed', {
  searchQuery: 'ergonomic chair',
  searchCategory: 'furniture',
  searchResults: 28
});

trackUserAction('product_viewed', {
  productId: '12345',
  productCategory: 'furniture'
});

// BAD - Inconsistent property naming
trackUserAction('search_performed', {
  query: 'ergonomic chair',
  category: 'furniture',
  resultCount: 28
});

trackUserAction('product_viewed', {
  id: '12345',
  productCategory: 'furniture'
});
```

## Integration in Different Parts of the Application

### React Components

```typescript
import { trackUserAction } from '../utils/analytics';
import { useState } from 'react';

function SignupForm() {
  const [formData, setFormData] = useState({});
  const startTime = Date.now();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createUser(formData);
      
      trackUserAction('user_registered', {
        method: formData.signupMethod,
        timeToComplete: (Date.now() - startTime) / 1000,
        fields: Object.keys(formData).length
      });
      
      // Show success message
    } catch (error) {
      trackError('registration_failed', {
        errorCode: error.code,
        errorMessage: error.message
      });
      
      // Show error message
    }
  };
  
  // Rest of component
}
```

### API Routes

```typescript
// pages/api/users.js
import { logEvent } from '../../utils/analytics-server';

export default async function handler(req, res) {
  // Get request data
  const requestStart = Date.now();
  
  try {
    // Process request
    const result = await processRequest(req.body);
    
    // Track successful API call
    logEvent('api_request_success', {
      endpoint: '/api/users',
      method: req.method,
      duration: Date.now() - requestStart,
      userId: req.user?.id
    });
    
    // Return response
    res.status(200).json(result);
  } catch (error) {
    // Track API error
    logEvent('api_request_failure', {
      endpoint: '/api/users',
      method: req.method,
      errorCode: error.code,
      errorMessage: error.message,
      duration: Date.now() - requestStart,
      userId: req.user?.id
    });
    
    // Return error response
    res.status(error.statusCode || 500).json({
      error: error.message
    });
  }
}
```

### Next.js Pages

```typescript
// pages/profile.js
import { trackPageView } from '../utils/analytics';
import { useEffect } from 'react';

export default function ProfilePage({ user }) {
  useEffect(() => {
    // Track page view when component mounts
    trackPageView('/profile', {
      userType: user.tier,
      membership: user.membershipStatus,
      profileCompleted: user.profileCompletionPercentage
    });
  }, [user]);
  
  // Rest of component
}
```

### Hooks for Common Tracking Patterns

Create hooks for commonly used tracking patterns:

```typescript
// hooks/useTrackedSubmit.js
import { trackUserAction, trackError } from '../utils/analytics';
import { useState } from 'react';

export function useTrackedSubmit(eventName, metadata = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = Date.now();
  
  const submit = async (callback) => {
    setIsSubmitting(true);
    
    try {
      const result = await callback();
      
      trackUserAction(eventName, {
        successful: true,
        duration: (Date.now() - startTime) / 1000,
        ...metadata
      });
      
      setIsSubmitting(false);
      return result;
    } catch (error) {
      trackError(`${eventName}_failed`, {
        errorMessage: error.message,
        duration: (Date.now() - startTime) / 1000,
        ...metadata
      });
      
      setIsSubmitting(false);
      throw error;
    }
  };
  
  return [submit, isSubmitting];
}

// Using the hook
function CheckoutForm() {
  const [processPayment, isProcessing] = useTrackedSubmit('payment_submitted', {
    paymentMethod: 'credit_card',
    checkoutType: 'guest'
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    processPayment(() => paymentApi.process(formData));
  };
  
  // Rest of component
}
```

## Testing Analytics Implementation

To ensure analytics are being implemented correctly, write tests:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { logEvent } from '../utils/analytics';
import LoginButton from './LoginButton';

// Mock the analytics module
jest.mock('../utils/analytics', () => ({
  logEvent: jest.fn(),
  trackUserAction: jest.fn()
}));

describe('LoginButton', () => {
  test('tracks button click when clicked', () => {
    render(<LoginButton />);
    
    // Find and click the button
    const button = screen.getByText('Log In');
    fireEvent.click(button);
    
    // Verify the analytics event was triggered
    expect(logEvent).toHaveBeenCalledWith('button_clicked', expect.objectContaining({
      buttonId: 'login-button',
      location: 'header'
    }));
  });
});
```

## Production Considerations

When deploying to production, ensure your analytics implementation:

1. **Respects User Privacy**: Only collect data you have permission to collect and need for business purposes.
2. **Handles High Volume**: Make sure your analytics infrastructure can handle the volume of events in production.
3. **Is Performant**: Analytics tracking should not impact application performance.
4. **Is Fault Tolerant**: If analytics tracking fails, it should not impact the main application functionality.

```typescript
// Example of fault-tolerant implementation
import { logEvent as originalLogEvent } from '../utils/analytics';

// Wrap with error handling
export const logEvent = (eventName, properties) => {
  try {
    return originalLogEvent(eventName, properties);
  } catch (error) {
    // Log to console in development, silently fail in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Analytics error:', error);
    }
    // Return a mock implementation
    return Promise.resolve({ success: false, error: error.message });
  }
};
```

## Conclusion

Following these guidelines ensures that analytics data is consistently collected and formatted across the VibeWell platform. This consistency makes it easier to analyze data, identify patterns, and make data-driven decisions to improve the application. 