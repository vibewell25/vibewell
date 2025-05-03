#!/bin/bash

# Rate Limiter Migration Script
# Helps users migrate from legacy rate limiter implementations to the consolidated one

# Set colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== VibeWell Rate Limiter Migration ===${NC}"
echo -e "${YELLOW}This script will guide you through migrating to the consolidated rate limiter.${NC}"
echo ""

# Check if nodejs is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed.${NC}"
    exit 1
fi

# Inform the user what we're about to do
echo -e "${BLUE}The migration process will:${NC}"
echo -e "1. Run the import migration script to update imports"
echo -e "2. Run tests to ensure everything is working correctly"
echo -e "3. Provide guidance on resolving any issues"
echo ""

# Confirm before proceeding
read -p "Do you want to proceed with the migration? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Migration cancelled.${NC}"
    exit 0
fi

echo -e "\n${GREEN}Running rate limiter import migration...${NC}"
node scripts/migrate-rate-limiter-imports.js

# Check if the migration script was successful
if [ $? -ne 0 ]; then
    echo -e "\n${RED}Migration script encountered errors. Please check the output above.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Running tests to verify the migration...${NC}"
npm test -- src/lib/rate-limiter/__tests__

# Check if tests passed
if [ $? -ne 0 ]; then
    echo -e "\n${RED}Tests failed. Please check the test output for details.${NC}"
    echo -e "${YELLOW}Common issues:${NC}"
    echo -e "- Missing imports"
    echo -e "- Using deprecated methods or properties"
    echo -e "- Type errors due to API changes"
    echo -e "\n${YELLOW}See docs/rate-limiter-migration.md for troubleshooting help.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Migration completed successfully!${NC}"
echo -e "${BLUE}All imports have been updated to use the consolidated rate limiter.${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Review your code for any custom rate limiter implementations"
echo -e "2. Update any documentation references to the old rate limiters"
echo -e "3. Consider implementing more granular rate limits using the new features"
echo -e "\n${BLUE}For more information, see:${NC}"
echo -e "- docs/rate-limiter-migration.md - Migration guide"
echo -e "- src/lib/rate-limiter/README.md - Full documentation"

exit 0 