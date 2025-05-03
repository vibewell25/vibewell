#!/bin/bash

# Cypress to Playwright Migration Script

# Configuration
CYPRESS_TESTS_DIR="cypress/e2e"
PLAYWRIGHT_TESTS_DIR="tests/e2e"
TEST_URL="http://localhost:3000"

# Function to convert Cypress test to Playwright
convert_test() {
    local cypress_file=$1
    local playwright_file=$2
    
    echo "Converting $cypress_file to $playwright_file..."
    
    # Create directory if it doesn't exist
    mkdir -p $(dirname $playwright_file)
    
    # Convert the test file
    cat > $playwright_file << 'EOL'
import { test, expect } from '@playwright/test';

test.describe('Vibewell Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('TEST_URL');
    });

    // Test cases will be converted here
});
EOL
    
    # Convert individual test cases
    while IFS= read -r line; do
        if [[ $line =~ ^it\( ]]; then
            # Extract test name and body
            test_name=$(echo $line | sed -E 's/it\(['\''"](.*)['\''"].*/\1/')
            test_body=$(echo $line | sed -E 's/it\(['\''"].*['\''"],\s*(.*)\)/\1/')
            
            # Convert Cypress commands to Playwright
            test_body=$(echo "$test_body" | sed '
                s/cy\.get(\(.*\))/await page.locator(\1)/g;
                s/cy\.click()/await page.click()/g;
                s/cy\.type(\(.*\))/await page.fill(\1)/g;
                s/cy\.should(\(.*\))/await expect(page).\1/g;
                s/cy\.visit(\(.*\))/await page.goto(\1)/g;
            ')
            
            # Add the converted test to the Playwright file
            cat >> $playwright_file << EOL

    test('$test_name', async ({ page }) => {
        $test_body
    });
EOL
        fi
    done < $cypress_file
}

# Function to set up Playwright
setup_playwright() {
    echo "Setting up Playwright..."
    
    # Install Playwright
    npm install -D @playwright/test
    
    # Install browsers
    npx playwright install
    
    # Create Playwright config
    cat > playwright.config.ts << 'EOL'
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './tests/e2e',
    timeout: 30000,
    retries: 2,
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
        {
            name: 'firefox',
            use: { browserName: 'firefox' },
        },
        {
            name: 'webkit',
            use: { browserName: 'webkit' },
        },
    ],
};

export default config;
EOL
}

# Main execution
echo "Starting Cypress to Playwright migration..."

# Set up Playwright
setup_playwright

# Convert all Cypress tests
for cypress_file in $(find $CYPRESS_TESTS_DIR -name "*.spec.js"); do
    playwright_file=$(echo $cypress_file | sed "s|$CYPRESS_TESTS_DIR|$PLAYWRIGHT_TESTS_DIR|" | sed 's/\.spec\.js/\.spec\.ts/')
    convert_test $cypress_file $playwright_file
done

echo "Migration completed"
echo "New Playwright tests are available in $PLAYWRIGHT_TESTS_DIR"
echo "Run tests with: npx playwright test" 