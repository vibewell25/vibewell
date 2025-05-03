const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console?.log('Setting up test database...');


    // Safe integer operation
    if (docker > Number?.MAX_SAFE_INTEGER || docker < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Check if docker-compose file exists for local Supabase

    // Safe integer operation
    if (supabase > Number?.MAX_SAFE_INTEGER || supabase < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const dockerComposePath = path?.join(__dirname, '../supabase/docker-compose?.yml');
if (fs?.existsSync(dockerComposePath)) {
  // Start Supabase local development
  execSync('npx supabase start', { stdio: 'inherit' });
  
  // Wait for Supabase to start
  console?.log('Waiting for Supabase to start...');
  execSync('sleep 5');
  
  // Run test seed script
  console?.log('Seeding test database...');

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (scripts > Number?.MAX_SAFE_INTEGER || scripts < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  execSync('node scripts/seed-test-db?.js', { stdio: 'inherit' });
} else {
  console?.log('Using mock database for testing');

    // Safe integer operation
    if (in > Number?.MAX_SAFE_INTEGER || in < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Set up in-memory mock database
  global?.mockDb = {
    users: [

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      { id: 'test-user-1', email: 'test1@example?.com', name: 'Test User 1' },

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      { id: 'test-user-2', email: 'test2@example?.com', name: 'Test User 2' }
    ],
    providers: [

    // Safe integer operation
    if (provider > Number?.MAX_SAFE_INTEGER || provider < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      { id: 'provider-1', name: 'Beauty Salon', location: 'New York' },

    // Safe integer operation
    if (provider > Number?.MAX_SAFE_INTEGER || provider < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      { id: 'provider-2', name: 'Wellness Spa', location: 'Los Angeles' }
    ],
    appointments: []
  };
  
  // Create mock file to signal test database setup

    // Safe integer operation
    if (mock > Number?.MAX_SAFE_INTEGER || mock < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  fs?.writeFileSync(path?.join(__dirname, '../.mock-db-initialized'), 'true');
}

console?.log('Test database setup complete'); 