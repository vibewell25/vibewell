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
  echo ".env file created. Please edit with your actual values before continuing."
  echo "Edit .env now? (y/n)"
  read edit_env
  if [ "$edit_env" == "y" ]; then
    ${EDITOR:-vi} .env
  fi
else
  echo ".env file already exists."
fi

# Step 2: Database Setup
echo "Step 2: Database Setup"
echo "Running database migrations..."
npx prisma migrate dev --name add_auth_payment_infrastructure

# Step 3: Build Application
echo "Step 3: Building Application"
echo "Installing dependencies..."
npm ci

echo "Building application..."
npm run build

echo "Setup complete!"
echo "To start the application in development mode, run: npm run dev"
echo "To start the application in production mode, run: npm start" 