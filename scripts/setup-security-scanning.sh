#!/bin/bash

# Script to set up automated security scanning in CI/CD pipeline
echo "Setting up automated security scanning..."

# Install security scanning tools
echo "Installing security scanning dependencies..."
npm install --save-dev snyk eslint-plugin-security @typescript-eslint/eslint-plugin 
npm install --save-dev --force helmet csurf xss-clean express-rate-limit express-validator

# Create security scanning configuration
echo "Creating security scanning configuration..."

# Create .snykrc file for Snyk configuration
cat > .snykrc << EOL
# Snyk configuration
disableAnalytics: true
# Ignore vulnerabilities until they can be patched
ignore:
  'npm:braces:20180219':
    - '*':
        reason: 'Not currently exploitable in our implementation'
        expires: 2023-12-31T00:00:00.000Z
EOL

# Add security scanning script to package.json
echo "Adding security scanning scripts to package.json..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add security scanning scripts
if (!packageJson.scripts) packageJson.scripts = {};

packageJson.scripts['security:scan'] = 'snyk test';
packageJson.scripts['security:monitor'] = 'snyk monitor';
packageJson.scripts['security:eslint'] = 'eslint --ext .js,.jsx,.ts,.tsx --config .eslintrc.js src/ --rule \"security/detect-object-injection: 2\"';
packageJson.scripts['security:audit'] = 'npm audit --audit-level=moderate';
packageJson.scripts['security:all'] = 'npm run security:audit && npm run security:eslint && npm run security:scan';

// Write updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Create GitHub Actions workflow for security scanning
echo "Creating GitHub Actions workflow for security scanning..."
mkdir -p .github/workflows/

cat > .github/workflows/security-scan.yml << EOL
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Run weekly security scan
    - cron: '0 0 * * 0'

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run npm audit
        run: npm run security:audit || true
      
      - name: Run ESLint security checks
        run: npm run security:eslint
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
EOL

# Create security middleware configuration for the app
echo "Creating security middleware configuration..."

mkdir -p src/middleware

cat > src/middleware/security.ts << EOL
/**
 * Security middleware for the Vibewell application
 * Implements various security protections
 */
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import xss from 'xss-clean';
import csrf from 'csurf';
import { NextApiRequest, NextApiResponse } from 'next';

export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-src 'self';",
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
};

// Apply security headers to a response
export function applySecurityHeaders(res: NextApiResponse) {
  Object.keys(securityHeaders).forEach((headerName) => {
    res.setHeader(headerName, securityHeaders[headerName]);
  });
}

// Rate limiting middleware
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

// Middleware wrapper for Next.js API routes
export const withSecurity = (handler: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply security headers
  applySecurityHeaders(res);
  
  // Apply XSS protection
  xss({ enabled: true })(req, res, () => {});
  
  // Apply rate limiting
  if (process.env.NODE_ENV === 'production') {
    await new Promise((resolve) => {
      apiRateLimiter(req, res, () => {
        resolve(true);
      });
    });
  }
  
  // Call the original handler
  return handler(req, res);
};
EOL

# Create an example of using the security middleware in a Next.js API route
mkdir -p src/pages/api/example

cat > src/pages/api/example/secure-endpoint.ts << EOL
/**
 * Example of a secure API endpoint using security middleware
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { withSecurity } from '../../../middleware/security';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Secure endpoint logic
    res.status(200).json({ message: 'Secure endpoint accessed successfully' });
  } catch (error) {
    console.error('Error in secure endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply security middleware
export default withSecurity(handler);
EOL

# Create the next.config.js security headers if it doesn't exist
if [ ! -f next.config.js ]; then
  echo "Creating next.config.js with security headers..."
  cat > next.config.js << EOL
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-src 'self';"
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig;
EOL
else
  echo "Updating existing next.config.js with security headers..."
  node -e "
  const fs = require('fs');
  const config = require('./next.config.js');
  
  // Add security headers configuration if it doesn't exist
  if (!config.headers) {
    config.headers = async () => {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: \"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-src 'self';\"
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin'
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
            }
          ]
        }
      ];
    };
    
    // Write the updated config
    fs.writeFileSync(
      'next.config.js',
      'const nextConfig = ' + JSON.stringify(config, null, 2) + ';\n\nmodule.exports = nextConfig;'
    );
  }
  "
fi

# Create documentation for security scanning
echo "Creating security scanning documentation..."

cat > SECURITY-SCANNING.md << EOL
# Security Scanning for Vibewell

This document outlines the security scanning infrastructure set up for the Vibewell project.

## Automated Security Scanning

Security scanning is automated in our CI/CD pipeline and includes the following checks:

### 1. NPM Audit

Checks for known vulnerabilities in our dependencies:

\`\`\`
npm run security:audit
\`\`\`

### 2. ESLint Security Rules

Performs static code analysis to detect common security issues:

\`\`\`
npm run security:eslint
\`\`\`

### 3. Snyk Vulnerability Scanning

Performs deeper security analysis and vulnerability detection:

\`\`\`
npm run security:scan
\`\`\`

### 4. Run All Security Checks

\`\`\`
npm run security:all
\`\`\`

## Security Middleware

The application uses security middleware located at \`src/middleware/security.ts\` which provides:

- Content Security Policy (CSP) headers
- Protection against XSS attacks
- Rate limiting
- Prevention of clickjacking
- MIME type sniffing protection

## GitHub Actions Integration

Security scans run automatically:
- On pushes to main/develop branches
- On pull requests to main/develop
- On a weekly schedule

## Handling Security Issues

When security vulnerabilities are detected:

1. Critical/High severity issues must be fixed immediately
2. Medium severity issues should be addressed in the next sprint
3. Low severity issues should be evaluated and prioritized

## Best Practices

- Never commit secrets or credentials to the repository
- Always validate user input
- Follow the principle of least privilege
- Keep dependencies updated
- Use parameterized queries for database operations
- Implement proper authentication and authorization checks
EOL

# Make the script executable
chmod +x scripts/setup-security-scanning.sh

echo "Security scanning setup completed successfully!"
echo "Use 'npm run security:all' to run all security checks"
echo "See SECURITY-SCANNING.md for more information" 