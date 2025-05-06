#!/bin/bash
set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}    Vibewell Web Deployment Script    ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Ensure we're in the project root directory
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}Current working directory: $(pwd)${NC}"

# Validate environment
if [ ! -f ".env.production" ]; then
  echo -e "${RED}Error: .env.production file not found!${NC}"
  echo -e "${YELLOW}Please create .env.production with the required environment variables.${NC}"
  exit 1
fi

# Parse command line arguments
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_LINT=false
SKIP_MIGRATION=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --env=*)
      ENVIRONMENT="${key#*=}"
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-lint)
      SKIP_LINT=true
      shift
      ;;
    --skip-migration)
      SKIP_MIGRATION=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $key${NC}"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}Deploying to: ${ENVIRONMENT}${NC}"

# Pull latest code
echo -e "${BLUE}Pulling latest code...${NC}"
git pull

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm ci

# Validate that the newly added packages are installed
echo -e "${BLUE}Validating packages...${NC}"
if ! npm list qrcode.react > /dev/null 2>&1; then
  echo -e "${YELLOW}Installing missing packages...${NC}"
  npm install qrcode.react
fi

# Run linting if not skipped
if [ "$SKIP_LINT" = false ]; then
  echo -e "${BLUE}Running lint...${NC}"
  npm run lint
else
  echo -e "${YELLOW}Skipping lint...${NC}"
fi

# Run tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
  echo -e "${BLUE}Running tests...${NC}"
  npm test
else
  echo -e "${YELLOW}Skipping tests...${NC}"
fi

# Run Prisma migrations if not skipped
if [ "$SKIP_MIGRATION" = false ]; then
  echo -e "${BLUE}Running database migrations...${NC}"
  
  # Ensure Prisma is installed
  if ! npm list prisma > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing Prisma CLI...${NC}"
    npm install -D prisma
  fi
  
  # Generate Prisma client to ensure it's up to date
  echo -e "${BLUE}Generating Prisma client...${NC}"
  npx prisma generate
  
  # Run migrations
  echo -e "${BLUE}Applying database migrations...${NC}"
  npx prisma migrate deploy
else
  echo -e "${YELLOW}Skipping database migrations...${NC}"
fi

# Build the application if not skipped
if [ "$SKIP_BUILD" = false ]; then
  echo -e "${BLUE}Building the application...${NC}"
  npm run build
else
  echo -e "${YELLOW}Skipping build...${NC}"
fi

# Prepare environment-specific files
echo -e "${BLUE}Preparing ${ENVIRONMENT} environment...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
  echo -e "${GREEN}Using production configuration${NC}"
  cp .env.production .env.local
elif [ "$ENVIRONMENT" = "staging" ]; then
  echo -e "${GREEN}Using staging configuration${NC}"
  cp .env.staging .env.local
else
  echo -e "${RED}Unknown environment: ${ENVIRONMENT}${NC}"
  exit 1
fi

# Running post-deployment checks
echo -e "${BLUE}Running post-deployment health checks...${NC}"
# Call the health check endpoint to verify deployment
if [ "$ENVIRONMENT" = "production" ]; then
  HEALTH_URL="https://vibewell.app/api/monitoring/health-check"
else
  HEALTH_URL="https://staging.vibewell.app/api/monitoring/health-check"
fi

echo -e "${YELLOW}Checking health at: ${HEALTH_URL}${NC}"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$HEALTH_STATUS" = "200" ]; then
  echo -e "${GREEN}Health check passed!${NC}"
else
  echo -e "${RED}Health check failed with status code: ${HEALTH_STATUS}${NC}"
  echo -e "${RED}Please check logs for more information.${NC}"
  exit 1
fi

# Final steps for specific environments
if [ "$ENVIRONMENT" = "production" ]; then
  echo -e "${BLUE}Running production-specific tasks...${NC}"
  # Invalidate CDN caches if necessary
  echo -e "${BLUE}Invalidating CDN cache...${NC}"
  # Add CDN cache invalidation command here
  
  # Notify monitoring systems
  echo -e "${BLUE}Sending deployment notification to monitoring systems...${NC}"
  # Add notification command here
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}The application is now live at:${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
  echo -e "${GREEN}https://vibewell.app${NC}"
else
  echo -e "${GREEN}https://staging.vibewell.app${NC}"
fi
echo -e "${BLUE}=======================================${NC}"

exit 0 