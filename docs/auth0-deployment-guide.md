# Auth0 Deployment Guide for VibeWell

This guide provides step-by-step instructions for setting up Auth0 authentication for the VibeWell platform in a production environment.

## Prerequisites

- Auth0 account
- Access to the VibeWell production environment
- Node.js and npm installed

## Step 1: Create Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com)
2. Create a new application:
   - Click "Applications" > "Create Application"
   - Name: "VibeWell"
   - Type: "Regular Web Application"
   - Click "Create"

## Step 2: Configure Application Settings

1. In your Auth0 application settings, configure the following URLs:
   ```
   Allowed Callback URLs: https://your-domain.com/api/auth/callback
   Allowed Logout URLs: https://your-domain.com
   Allowed Web Origins: https://your-domain.com
   ```
   Replace `your-domain.com` with your actual production domain.

2. Note down the following values:
   - Domain
   - Client ID
   - Client Secret

## Step 3: Create Auth0 API

1. Go to "APIs" > "Create API"
2. Configure:
   - Name: "VibeWell API"
   - Identifier: `https://api.vibewell.com`
   - Signing Algorithm: RS256

## Step 4: Set Up Environment Variables

1. Update your production environment variables with the Auth0 configuration:
   ```
   AUTH0_BASE_URL=https://your-domain.com
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_SECRET=your-generated-secret
   AUTH0_AUDIENCE=https://api.vibewell.com
   AUTH0_NAMESPACE=https://vibewell.com
   ```

## Step 5: Set Up Management API

1. Go to "Applications" > "APIs" > "Auth0 Management API"
2. Authorize your application
3. Note down:
   - Management API Client ID
   - Management API Client Secret
4. Add to environment variables:
   ```
   AUTH0_MANAGEMENT_CLIENT_ID=your-management-client-id
   AUTH0_MANAGEMENT_CLIENT_SECRET=your-management-client-secret
   ```

## Step 6: Run Setup Script

1. Run the Auth0 setup script to create roles and rules:
   ```bash
   npm run setup:auth0
   ```

## Step 7: Configure Rules

1. Verify the "Assign Roles to Users" rule was created
2. Adjust the email domain rules in the script if needed
3. Test the rule with different email domains

## Step 8: Testing

1. Test user registration with different email domains
2. Verify role assignment works correctly
3. Test login/logout flow
4. Verify protected routes are working

## Step 9: Security Considerations

1. Enable Multi-factor Authentication (MFA)
2. Configure password policies
3. Set up brute force protection
4. Enable email verification

## Step 10: Monitoring

1. Set up Auth0 logs in your monitoring system
2. Configure alerts for suspicious activities
3. Monitor failed login attempts

## Troubleshooting

### Common Issues

1. Callback URL errors:
   - Verify all URLs are correctly configured
   - Check for HTTP vs HTTPS mismatches

2. Token errors:
   - Verify audience and scope configuration
   - Check token expiration settings

3. Role assignment issues:
   - Check rule configuration
   - Verify email domains in rules

### Support

For additional support:
1. Check Auth0 documentation: https://auth0.com/docs
2. Contact VibeWell support team
3. Review Auth0 community forums

## Maintenance

1. Regularly review and update Auth0 rules
2. Monitor and rotate client secrets
3. Keep Auth0 dependencies updated
4. Review and update security settings 