# VibeWell Deployment Guide

## Prerequisites

- Node.js (%NODE_VERSION%)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Apple Developer Account (for iOS)
- Google Play Console Account (for Android)
- AWS Account (for backend services)

## Environment Setup

1. Create a `.env` file in the root directory:
```bash
API_URL=your_api_url
SENTRY_DSN=your_sentry_dsn
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

2. Create a `mobile/.env` file for mobile-specific configuration:
```bash
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Backend Deployment

1. Set up AWS infrastructure:
```bash
cd backend
terraform init
terraform plan
terraform apply
```

2. Deploy the API:
```bash
npm run build
npm run deploy:prod
```

## Mobile App Deployment

### Development Build

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
expo start
```

### Production Build

1. Configure EAS Build:
```bash
eas build:configure
```

2. Build for iOS:
```bash
eas build --platform ios
```

3. Build for Android:
```bash
eas build --platform android
```

4. Submit to stores:
```bash
eas submit -p ios
eas submit -p android
```

## Monitoring & Maintenance

1. Set up monitoring:
- Configure Sentry for error tracking
- Set up AWS CloudWatch alerts
- Enable performance monitoring

2. Database backups:
- Automated daily backups
- Weekly integrity checks
- Monthly backup restoration tests

3. Security updates:
- Regular dependency updates
- Security patch deployment
- SSL certificate renewal

## Troubleshooting

### Common Issues

1. Build failures:
- Check Node.js version
- Clear npm cache
- Rebuild node_modules

2. API connection issues:
- Verify API URL configuration
- Check network security groups
- Validate SSL certificates

3. Push notification failures:
- Verify push certificates
- Check device token registration
- Validate notification payload

## Rollback Procedures

1. Backend rollback:
```bash
npm run rollback --version=previous_version
```

2. Mobile app rollback:
```bash
eas build:rollback
```

## Contact & Support

For deployment support:
- Email: devops@vibewell.com
- Slack: #deployment-support
- Emergency: +1-XXX-XXX-XXXX 