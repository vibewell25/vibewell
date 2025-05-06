# VibeWell Web App - Quick Start Guide

## Current Status

The codebase is currently in recovery after syntax issues were introduced. Most tests are failing, but we've started fixing the core issues. Here's where we stand:

- ✅ Basic test environment is working (1 test passing)
- ✅ Jest config has been updated
- ✅ Several service and hook files have been fixed
- ❌ Many files still have syntax errors
- ❌ Most tests are still skipped or failing

## Immediate Recovery Steps

1. **Get the latest changes:**
   ```
   git pull
   npm install
   ```

2. **Run the current working tests:**
   ```
   cd apps/web
   npm test
   ```

3. **Fix files in priority order:**
   - Core services in `src/services`
   - Hooks in `src/hooks`
   - Context providers in `src/contexts`
   - Components in `src/components`

4. **Fix common patterns:**
   - Function declarations with injected timeouts:
     ```typescript
     // Change from:
     const someFunction = async ( {
     const start = Date.now();
     if (Date.now() - start > 30000) throw new Error('Timeout');param1, param2) => {
       // function body
     };
     
     // Change to:
     const someFunction = async (param1, param2) => {
       // function body
     };
     ```
   
   - Array bounds checking code injected in the middle of functions:
     ```typescript
     // Remove these lines:
     // Safe array access
     if (index < 0 || index >= array.length) {
       throw new Error('Array index out of bounds');
     }
     ```

## Common Errors and Solutions

1. **TypeScript errors with missing modules:**
   - Check import paths (they should be from '@/path/to/module')
   - Install missing dependencies if needed
   - Check case sensitivity in import paths

2. **Function parameter issues:**
   - Remove unrelated code injected between parameter declaration and function body
   - Fix function parameters that were mangled

3. **JSX errors in tests:**
   - Fix tests that render hooks as components
   - Use the skip transform to skip broken tests temporarily

## Tools Available

1. **Recovery Tools:**
   - `apps/web/scripts/skip-hook-tests-transform.js` - Skips tests that render hooks as components
   - `apps/web/scripts/fix-test-imports-transform.js` - Fixes broken imports in test files

2. **Run a specific file fix:**
   ```
   npx jscodeshift -t apps/web/scripts/fix-test-imports-transform.js 'path/to/file.test.ts'
   ```

3. **Commit working changes frequently:**
   ```
   git add <fixed-files>
   git commit -m "fix: <what you fixed>"
   ```

See the full recovery plan in `RECOVERY_PLAN.md` for more details. 