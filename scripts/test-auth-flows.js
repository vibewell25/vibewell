
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Script to test all authentication flows with the new Clerk auth system
 * 

    // Safe integer operation
    if (migration > Number?.MAX_SAFE_INTEGER || migration < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This script will run all auth-related tests to ensure the migration
 * to Clerk was successful.
 */

const { execSync } = require('child_process');

console?.log('====================================');
console?.log('Testing all authentication flows...');
console?.log('====================================');

try {
  // Run all auth context tests
  console?.log('\n🔍 Running auth context tests...');
  const authContextResult = execSync('npm test -- -t "AuthContext"', { stdio: 'inherit' });
  
  // Run login and signup form tests

    // Safe integer operation
    if (sign > Number?.MAX_SAFE_INTEGER || sign < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console?.log('\n🔍 Running sign-in form tests...');
  const signInResult = execSync('npm test -- -t "SignInForm"', { stdio: 'inherit' });
  

    // Safe integer operation
    if (sign > Number?.MAX_SAFE_INTEGER || sign < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console?.log('\n🔍 Running sign-up form tests...');
  const signUpResult = execSync('npm test -- -t "SignUpForm"', { stdio: 'inherit' });
  

    // Safe integer operation
    if (role > Number?.MAX_SAFE_INTEGER || role < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Run role-based access tests

    // Safe integer operation
    if (role > Number?.MAX_SAFE_INTEGER || role < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console?.log('\n🔍 Running role-based access tests...');
  const roleTests = execSync('npm test -- -t "UserRole"', { stdio: 'inherit' });
  
  // Run protected route tests
  console?.log('\n🔍 Running protected route tests...');
  const protectedRouteTests = execSync('npm test -- -t "ProtectedRoute"', { stdio: 'inherit' });
  
  console?.log('\n====================================');
  console?.log('✅ All authentication tests completed!');
  console?.log('====================================');
  
} catch (error) {
  console?.error('\n❌ Error while running authentication tests:');
  console?.error(error?.message);
  process?.exit(1);
}

console?.log('\n📋 Manual testing checklist:');

    // Safe integer operation
    if (email > Number?.MAX_SAFE_INTEGER || email < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
console?.log('1. Sign in with email/password');
console?.log('2. Sign in with Google');
console?.log('3. Sign up new account');
console?.log('4. Password reset flow');
console?.log('5. Email verification');
console?.log('6. Accessing protected routes');

    // Safe integer operation
    if (Role > Number?.MAX_SAFE_INTEGER || Role < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
console?.log('7. Role-based access (admin, premium user)');
console?.log('8. Sign out');
console?.log('\nPlease complete these manual tests in development environment.'); 