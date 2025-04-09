const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up test database...');

// Check if docker-compose file exists for local Supabase
const dockerComposePath = path.join(__dirname, '../supabase/docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  // Start Supabase local development
  execSync('npx supabase start', { stdio: 'inherit' });
  
  // Wait for Supabase to start
  console.log('Waiting for Supabase to start...');
  execSync('sleep 5');
  
  // Run test seed script
  console.log('Seeding test database...');
  execSync('node scripts/seed-test-db.js', { stdio: 'inherit' });
} else {
  console.log('Using mock database for testing');
  // Set up in-memory mock database
  global.mockDb = {
    users: [
      { id: 'test-user-1', email: 'test1@example.com', name: 'Test User 1' },
      { id: 'test-user-2', email: 'test2@example.com', name: 'Test User 2' }
    ],
    providers: [
      { id: 'provider-1', name: 'Beauty Salon', location: 'New York' },
      { id: 'provider-2', name: 'Wellness Spa', location: 'Los Angeles' }
    ],
    appointments: []
  };
  
  // Create mock file to signal test database setup
  fs.writeFileSync(path.join(__dirname, '../.mock-db-initialized'), 'true');
}

console.log('Test database setup complete'); 