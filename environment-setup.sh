#!/bin/bash
set -e

# Step 1: Prepare Environment
echo "Step 1: Preparing Environment"

if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vibewell_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# Auth
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# WebAuthn
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLIC_KEY=pk_test_your_public_key

# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
EOF
  echo ".env file created. Please edit with your actual values."
  echo ""
  echo "For production deployment, update the following values:"
  echo "NODE_ENV=production"
  echo "DATABASE_URL=postgresql://user:password@host:port/database"
  echo "REDIS_HOST=your-redis-host"
  echo "REDIS_PASSWORD=your-redis-password"
  echo "REDIS_TLS=true"
  echo "AUTH0_BASE_URL=https://yourdomain.com"
  echo "WEBAUTHN_RP_ID=yourdomain.com"
  echo "WEBAUTHN_ORIGIN=https://yourdomain.com"
  echo "STRIPE_SECRET_KEY=sk_live_your_stripe_secret"
else
  echo ".env file already exists."
fi

echo "Environment setup completed." 