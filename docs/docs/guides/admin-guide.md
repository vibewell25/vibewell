# Vibewell Admin Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [User Management](#user-management)
4. [Provider Management](#provider-management)
5. [Content Management](#content-management)
6. [Booking Management](#booking-management)
7. [AR Model Management](#ar-model-management)
8. [Reporting & Analytics](#reporting--analytics)
9. [System Configuration](#system-configuration)
10. [Maintenance Procedures](#maintenance-procedures)
11. [Troubleshooting](#troubleshooting)
12. [Security Management](#security-management)
13. [Best Practices](#best-practices)

## Introduction

This guide provides comprehensive instructions for administering the Vibewell platform. It covers all aspects of system administration, including user management, content moderation, system configuration, maintenance procedures, and troubleshooting common issues.

### Admin Roles and Permissions

Vibewell supports multiple admin roles with different permission levels:

| Role | Description | Permissions |
|------|-------------|-------------|
| Super Admin | Full system access | All permissions |
| User Admin | User management focus | User CRUD, profile management |
| Content Admin | Content management focus | Content CRUD, moderation |
| Provider Admin | Provider management focus | Provider CRUD, verification |
| Support Admin | Customer support focus | Read-most data, limited write access |

## Admin Dashboard Overview

### Accessing the Admin Dashboard

1. Navigate to `https://admin.vibewell.com`
2. Sign in with your admin credentials
3. For security reasons, admin accounts require two-factor authentication

### Dashboard Layout

The admin dashboard is organized into the following main sections:

- **Overview**: Key metrics and system health
- **Users**: User management tools
- **Providers**: Provider management and verification
- **Bookings**: Booking oversight and management
- **Content**: Content management and moderation
- **AR Models**: AR model management
- **Analytics**: Detailed reporting and analytics
- **System**: System configuration and maintenance
- **Logs**: System and audit logs

### Key Performance Indicators

The overview dashboard displays these critical KPIs:

- Active users (daily, weekly, monthly)
- New user registrations
- Provider onboarding
- Booking volume and completion rate
- Revenue metrics
- System performance indicators

## User Management

### Viewing and Searching Users

1. Navigate to the **Users** section in the admin dashboard
2. Use the search functionality to find users by:
   - Email address
   - Username
   - Phone number
   - User ID
   - Registration date range

### User Profile Management

From a user's profile, you can:

1. **View user details**:
   - Account information
   - Profile completeness
   - Activity history
   - Booking history
   - Payment history

2. **Edit user information**:
   - Update name, email, or phone
   - Change user role
   - Adjust notification settings
   - Manage preferences

3. **Security management**:
   - Reset password
   - Enable/disable two-factor authentication
   - Lock/unlock account
   - View login history and sessions

### User Verification

For enhanced platform security, verify users by:

1. Navigate to user profile > Verification tab
2. Review submitted verification documents
3. Approve or reject verification with comments
4. Set verification level (Basic, Enhanced, Premium)

### Account Actions

For account management:

1. **Suspend Account**: Temporarily disable user access
   - Navigate to user profile > Actions > Suspend
   - Select suspension reason and duration
   - User will be notified via email

2. **Delete Account**: Permanently remove user data
   - Navigate to user profile > Actions > Delete
   - Requires secondary admin approval for safety
   - Follows GDPR compliance procedures for data deletion

## Provider Management

### Provider Approval Process

New provider applications follow this approval workflow:

1. Provider submits business profile with required documentation
2. Application appears in **Providers > Pending Approval** queue
3. Admin reviews business details and documentation:
   - Business license verification
   - Professional certifications
   - Identity verification
   - Insurance documentation
4. Approve, reject, or request additional information
5. Upon approval, provider receives notification and onboarding instructions

### Managing Provider Profiles

1. Navigate to **Providers** section
2. Search for specific provider by name, ID, or location
3. Select provider to view detailed profile
4. Edit provider details:
   - Business information
   - Service offerings
   - Operating hours
   - Location information
   - Staff profiles

### Provider Verification Badges

Assign verification badges to providers:

1. Navigate to provider profile > Verification
2. Review verification criteria:
   - Identity verified
   - License verified
   - Insurance verified
   - Address verified
   - Quality verified (based on reviews)
3. Assign appropriate verification badges
4. Badges display on the provider's public profile

### Service Management

For provider services:

1. Navigate to provider profile > Services
2. Review service details for accuracy and completeness
3. Approve, edit, or reject services based on platform guidelines
4. Manage service categories and pricing tiers

## Content Management

### Content Moderation

1. Navigate to **Content** section
2. View content sorted by type (articles, provider content, user-generated)
3. Use moderation queue to review flagged content
4. For each content item:
   - Approve and publish
   - Edit before publishing
   - Reject with reason
   - Flag for additional review

### Managing Articles and Wellness Content

1. Navigate to **Content > Articles**
2. Create new articles or edit existing ones
3. Schedule publication dates
4. Assign categories and tags
5. Feature important content on homepage

### User-Generated Content Review

1. Navigate to **Content > User Content**
2. Review photos, reviews, and comments
3. Filter by flagged content
4. Moderate based on community guidelines

## Booking Management

### Booking Overview

1. Navigate to **Bookings** section
2. View bookings with filters:
   - Date range
   - Status (pending, confirmed, completed, cancelled)
   - Provider
   - Service type
   - User

### Managing Booking Issues

For handling booking conflicts and problems:

1. Navigate to **Bookings > Issues**
2. Review reported problems
3. Contact involved parties if necessary
4. Resolve with appropriate action:
   - Reschedule
   - Cancel with or without penalty
   - Issue refund if applicable
   - Add compensatory credit to user account

### Booking Reports

Generate booking reports for operational insights:

1. Navigate to **Bookings > Reports**
2. Select report type:
   - Booking volume by time period
   - Cancellation analysis
   - Provider performance
   - Service popularity
3. Filter by date range and other parameters
4. Export as CSV or PDF

## AR Model Management

### Managing AR Model Library

1. Navigate to **AR Models** section
2. View all models with filters by:
   - Category (makeup, hairstyle, accessories)
   - Upload date
   - Usage statistics
   - File size

### Adding New AR Models

1. Navigate to **AR Models > Add New**
2. Upload model files (GLB/GLTF format)
3. Add metadata:
   - Model name
   - Description
   - Category
   - Tags
   - Thumbnail images
   - Preview images
4. Test model rendering and performance
5. Publish to model library

### Optimizing AR Models

For models with performance issues:

1. Navigate to model details > Performance
2. Review performance metrics:
   - Load time
   - Frame rate
   - Memory usage
   - Device compatibility
3. Access optimization tools:
   - Compress textures
   - Reduce polygon count
   - Generate LOD (Level of Detail) versions
4. Test optimized model before republishing

## Reporting & Analytics

### Analytics Dashboard

1. Navigate to **Analytics** section
2. View platform-wide metrics:
   - User acquisition and retention
   - Engagement metrics
   - Conversion rates
   - Revenue analytics
   - Provider performance
   - Feature usage

### Custom Report Generation

1. Navigate to **Analytics > Custom Reports**
2. Select report parameters:
   - Metrics to include
   - Time period
   - Segmentation options
   - Visualization preferences
3. Generate report
4. Schedule regular report delivery (daily, weekly, monthly)
5. Export in various formats (PDF, CSV, Excel)

### Data Export

For detailed data analysis:

1. Navigate to **Analytics > Data Export**
2. Select data type to export
3. Apply filters and date ranges
4. Start export process
5. Download compressed file when ready
6. Note: Personal data is anonymized in exports by default

## System Configuration

### General Settings

1. Navigate to **System > Settings**
2. Configure platform settings:
   - Platform name and branding
   - Contact information
   - Support email and phone
   - Terms of service and privacy policy links
   - Default language and timezone
   - Currency settings

### Email Configuration

1. Navigate to **System > Email Settings**
2. Configure email providers and credentials
3. Set up email templates for:
   - User registration
   - Booking confirmations
   - Reminders
   - Marketing communications
   - Administrative notifications
4. Test email delivery

### Payment Gateway Settings

1. Navigate to **System > Payment**
2. Configure payment providers:
   - Stripe integration settings
   - PayPal integration (if applicable)
   - Other payment methods
3. Set transaction fees and policies
4. Configure refund rules and procedures

### Security Settings

1. Navigate to **System > Security**
2. Configure security policies:
   - Password requirements
   - Session timeout
   - Two-factor authentication requirements
   - API rate limiting
   - IP blocking rules

## Maintenance Procedures

### Scheduled Maintenance

Plan and execute maintenance activities:

1. Navigate to **System > Maintenance**
2. Schedule maintenance window
3. Create maintenance announcement
4. Enable maintenance mode when ready
5. Perform required updates or maintenance
6. Test system functionality after maintenance
7. Disable maintenance mode

### Database Maintenance

Regular database optimization:

1. Navigate to **System > Database**
2. View database status and statistics
3. Schedule optimization tasks:
   - Index rebuilding
   - Query optimization
   - Data archiving
   - Backup verification

### System Updates

For platform updates:

1. Navigate to **System > Updates**
2. Review available updates
3. Create backup before proceeding
4. Apply updates in staging environment first
5. Schedule production update
6. Monitor system during and after update

## Troubleshooting

### Common Issues and Solutions

#### User Authentication Issues

**Problem**: Users unable to log in
**Solutions**:
1. Check user account status in admin panel
2. Verify email verification status
3. Reset user password if necessary
4. Check for IP blocking or security measures triggered

#### Payment Processing Problems

**Problem**: Failed payment transactions
**Solutions**:
1. Navigate to **Payments > Transactions**
2. Look for error codes and details
3. Verify payment gateway status
4. Check transaction logs for specific errors
5. Contact payment provider if needed

#### Booking System Issues

**Problem**: Bookings not being created or confirmed
**Solutions**:
1. Check provider availability settings
2. Verify service configuration
3. Test booking process as an admin
4. Review system logs for errors

### System Health Monitoring

1. Navigate to **System > Health**
2. Review key system metrics:
   - Server response time
   - Database query performance
   - API response times
   - Error rates
   - Storage usage
3. Set up alerts for critical thresholds

### Error Logs

1. Navigate to **System > Logs**
2. Filter logs by:
   - Severity (error, warning, info)
   - Module (user, booking, payment, etc.)
   - Time period
   - User or session ID
3. Export logs for detailed analysis
4. Set up log rotation and archiving policies

## Security Management

### Security Monitoring

1. Navigate to **Security > Monitoring**
2. Review security events:
   - Failed login attempts
   - Permission violations
   - Unusual user behavior
   - API usage patterns
3. Investigate suspicious activities
4. Respond to security alerts

### User Session Management

1. Navigate to **Security > Sessions**
2. View active user sessions across the platform
3. Filter by user, role, IP, or session age
4. Force logout for suspicious sessions
5. Invalidate all sessions for a specific user if necessary

### Audit Logs

1. Navigate to **Security > Audit Logs**
2. Review comprehensive activity trail
3. Filter by:
   - User
   - Action type
   - Module
   - Date range
4. Export audit logs for compliance purposes
5. Set up retention policies in line with requirements

## Best Practices

### User Management Best Practices

1. **Regular account review**:
   - Audit admin accounts quarterly
   - Review permission assignments
   - Remove unnecessary privileges
   - Update security questions and recovery options

2. **Verification process**:
   - Maintain consistent verification standards
   - Document reasons for verification decisions
   - Regularly review verification requirements
   - Update verification processes as regulations change

### Content Moderation Best Practices

1. **Consistent application of guidelines**:
   - Train all moderators on the same standards
   - Document moderation decisions for reference
   - Regular review of moderation decisions for consistency
   - Update guidelines as needed based on emerging patterns

2. **Efficient moderation workflow**:
   - Process reported content within 24 hours
   - Prioritize sensitive content categories
   - Use automation to pre-filter obvious violations
   - Conduct random audits of non-reported content

### System Maintenance Best Practices

1. **Proactive monitoring**:
   - Set up alerts for system anomalies
   - Regularly review performance trends
   - Address issues before they impact users
   - Maintain a performance baseline

2. **Update planning**:
   - Test all updates in staging environment
   - Schedule updates during low-traffic periods
   - Prepare rollback procedures
   - Communicate maintenance windows in advance

3. **Backup strategy**:
   - Maintain daily backups
   - Test restore procedures quarterly
   - Secure offsite backup storage
   - Document recovery time objectives

### Security Best Practices

1. **Account security**:
   - Enforce strong password policies
   - Require 2FA for all admin accounts
   - Regularly rotate access credentials
   - Implement session timeouts

2. **Access control**:
   - Apply principle of least privilege
   - Review access regularly
   - Remove access immediately when not needed
   - Maintain separation of duties for critical functions

3. **Incident response**:
   - Document security incident response procedures
   - Conduct regular training exercises
   - Maintain contact information for response team
   - Review and update procedures annually 