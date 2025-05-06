# Authentication Components

## Overview
Authentication components handle user authentication, registration, and security features in the VibeWell application.

## Components

### LoginForm
A form component for user authentication.

```typescript
import { LoginForm } from '@vibewell/components';

<LoginForm 
  onSubmit={(credentials) => handleLogin(credentials)}
  onForgotPassword={() => navigate('/forgot-password')}
/>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onSubmit | `(credentials: LoginCredentials) => Promise<void>` | Yes | Callback when form is submitted |
| onForgotPassword | `() => void` | No | Callback for forgot password link |
| loading | `boolean` | No | Shows loading state |
| error | `string` | No | Displays error message |

### TwoFactorAuthSetup
Component for setting up two-factor authentication.

```typescript
import { TwoFactorAuthSetup } from '@vibewell/components';

<TwoFactorAuthSetup
  onComplete={(success) => handleSetupComplete(success)}
  onCancel={() => cancelSetup()}
/>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onComplete | `(success: boolean) => void` | Yes | Callback when setup is complete |
| onCancel | `() => void` | No | Callback to cancel setup |
| loading | `boolean` | No | Shows loading state |

### SecuritySettingsScreen
Screen component for managing security settings.

```typescript
import { SecuritySettingsScreen } from '@vibewell/components';

<SecuritySettingsScreen
  user={currentUser}
  onSave={(settings) => updateSecuritySettings(settings)}
/>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | `User` | Yes | Current user object |
| onSave | `(settings: SecuritySettings) => Promise<void>` | Yes | Callback to save settings |
| loading | `boolean` | No | Shows loading state |

### PrivacySettingsScreen
Screen component for managing privacy settings.

```typescript
import { PrivacySettingsScreen } from '@vibewell/components';

<PrivacySettingsScreen
  user={currentUser}
  onSave={(settings) => updatePrivacySettings(settings)}
/>
```

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | `User` | Yes | Current user object |
| onSave | `(settings: PrivacySettings) => Promise<void>` | Yes | Callback to save settings |
| loading | `boolean` | No | Shows loading state |

## Best Practices

### Security
1. Always use HTTPS for authentication requests
2. Implement rate limiting for authentication attempts
3. Use secure storage for tokens and sensitive data
4. Validate all user inputs
5. Implement proper error handling

### Accessibility
1. All forms should be keyboard navigable
2. Error messages should be announced to screen readers
3. Use ARIA labels where necessary
4. Maintain proper focus management
5. Provide clear feedback for all user actions

### State Management
1. Handle loading states appropriately
2. Show clear error messages
3. Provide feedback for successful actions
4. Maintain consistent state across components
5. Use proper form validation

## Examples

### Complete Authentication Flow
```typescript
import { LoginForm, TwoFactorAuthSetup } from '@vibewell/components';

function AuthenticationFlow() {
  const [step, setStep] = useState('login');
  
  const handleLogin = async (credentials) => {
    try {
      const result = await loginUser(credentials);
      if (result.requiresTwoFactor) {
        setStep('2fa');
      } else {
        navigateToHome();
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div>
      {step === 'login' && (
        <LoginForm 
          onSubmit={handleLogin}
          onForgotPassword={() => setStep('forgot')}
        />
      )}
      {step === '2fa' && (
        <TwoFactorAuthSetup
          onComplete={(success) => {
            if (success) navigateToHome();
          }}
        />
      )}
    </div>
  );
} 