# Environment Configuration Guide

## Development Environment

### Required Software

1. Node.js
   - Version: 18.x or later
   - Installation: [https://nodejs.org/](https://nodejs.org/)

2. Expo CLI
   ```bash
   npm install -g expo-cli
   ```

3. Development Tools
   - VS Code with extensions:
     - ESLint
     - Prettier
     - React Native Tools
     - TypeScript
   - Xcode (for iOS development)
   - Android Studio (for Android development)

### Environment Variables

#### Backend (.env)
```bash
# API Configuration
NODE_ENV=development
PORT=3000
API_VERSION=%API_VERSION%

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vibewell_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# External Services
SENTRY_DSN=your_sentry_dsn
GOOGLE_MAPS_API_KEY=your_google_maps_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

#### Mobile (.env)
```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_API_VERSION=%API_VERSION%

# External Services
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key

# Feature Flags
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_ANALYTICS=true
```

## Testing Environment

```bash
# API Configuration
NODE_ENV=testing
PORT=3001
API_VERSION=%API_VERSION%

# Test Database
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=vibewell_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=test_password

# Test Authentication
TEST_JWT_SECRET=test_jwt_secret
```

## Production Environment

```bash
# API Configuration
NODE_ENV=production
PORT=80
API_VERSION=%API_VERSION%

# Database
DB_HOST=your_production_host
DB_PORT=5432
DB_NAME=vibewell_prod
DB_USER=your_prod_user
DB_PASSWORD=your_prod_password

# Authentication
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRATION=24h

# External Services
SENTRY_DSN=your_production_sentry_dsn
GOOGLE_MAPS_API_KEY=your_production_google_maps_key
AWS_ACCESS_KEY_ID=your_production_aws_key
AWS_SECRET_ACCESS_KEY=your_production_aws_secret
```

## Security Considerations

1. Environment Variables
   - Never commit `.env` files to version control
   - Use different values for each environment
   - Rotate secrets regularly

2. API Keys
   - Use restricted API keys
   - Implement key rotation
   - Monitor usage and set alerts

3. Database
   - Use strong passwords
   - Enable SSL connections
   - Regular security audits

## Deployment Checklist

1. Environment Variables
   - [ ] All required variables are set
   - [ ] Secrets are properly secured
   - [ ] API keys are valid

2. Database
   - [ ] Migrations are up to date
   - [ ] Backups are configured
   - [ ] Monitoring is enabled

3. External Services
   - [ ] All services are configured
   - [ ] API keys are valid
   - [ ] Rate limits are set

4. Security
   - [ ] SSL certificates are valid
   - [ ] Firewalls are configured
   - [ ] Security headers are set 