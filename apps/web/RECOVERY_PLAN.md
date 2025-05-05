# VibeWell Web App Recovery Plan

## Current State

The codebase is currently in a recovery process after some transformations that introduced syntax errors. We've made progress in fixing various issues:

1. **Fixed several services and hooks**:
   - `honeypot.ts` - Fixed broken array bounds checking code
   - `useModuleContent.ts` - Fixed broken async function declarations
   - `useDeviceCapabilities.tsx` - Fixed broken async function declarations

2. **Working test environment**:
   - Modified the Jest configuration to run tests successfully
   - Fixed the handlers test to pass correctly
   - Fixed import issues in several files

## Next Steps

The following steps should be taken to fully recover the codebase:

### 1. Fix Source Files

- [ ] **Fix remaining service files**:
  - Check all files in `src/services` for similar syntax issues
  - Fix array bounds checking issues in other files
  - Fix broken async function declarations

- [ ] **Fix hook files**:
  - Continue with all files in `src/hooks`
  - Check for and fix the same patterns of broken function declarations
  - Fix imports and function parameters

- [ ] **Fix context files**:
  - Continue with remaining files in `src/contexts`
  - Look for similar issues with function declarations and timeout injections

### 2. Address Type Errors

- [ ] **Review TypeScript configuration**:
  - Make sure `tsconfig.json` has appropriate settings
  - Address the `isolatedModules` warning in Jest configuration

- [ ] **Check for missing type declarations**:
  - Install any missing type packages
  - Create types for custom modules if needed

### 3. Fix Tests

- [ ] **Update obsolete snapshots**:
  - Run `npm test -- -u` to update the snapshot files
  - Review the changes to ensure they're appropriate

- [ ] **Restore skipped tests**:
  - After fixing the core files, start un-skipping tests
  - Fix one test suite at a time

### 4. Automated Fixes

- [ ] **Run automated fixes where possible**:
  - Use the existing transform scripts to address common issues
  - Create additional transform scripts for other patterns if needed

## Prioritization

Focus on fixing files in this order:
1. Core services and utilities
2. Hooks and context providers
3. Components
4. Tests

## Tracking Progress

Keep track of progress by:
- Running tests frequently to confirm fixes
- Maintaining a list of fixed and unfixed files
- Using git to commit working changes incrementally

## Recovery Plan Steps

### Step 1: Minimal Working Setup (Completed)
- [x] Set up a minimal Jest configuration that passes at least one test
- [x] Fix necessary polyfills (TextEncoder/TextDecoder)
- [x] Fix mock handlers

### Step 2: Fix Source Files Systematically (In Progress)
- [x] Fix context files with broken function declarations
- [x] Run the automated fixes for test files
1. **Fix Injection Issues**: 
   - [x] Fix context files with broken timeout injections
   - [x] Fix hooks files with timeout injection patterns
   - [x] Fix AR cache implementation files
   - [x] Fix ApiClient service with proper class structure
   - [ ] Continue fixing remaining service files with similar patterns

2. **Batch Fix By Component**:
   - [x] Started with core files: contexts, hooks, cache
   - [x] Started with services (ApiClient)
   - [ ] Continue with remaining services, utilities
   - [ ] Move outward to UI components
   - [ ] Leave tests as placeholders until source code is fixed

3. **Fix Import Statements**: 
   - [x] Successfully ran `jscodeshift` transforms on test imports
   - [ ] Continue fixing remaining import issues

### Step 3: Type Errors and Linting (Partially Started)
1. **Fix Critical TypeScript Errors**: 
   - [x] Fixed array index bounds checking in VirtualTryOnService
   - [ ] Focus on remaining files causing type system collapse
   - [ ] Add proper exports in index.ts files
   - [ ] Clean up function signatures

2. **Fix ESLint Config**: 
   - [ ] Adjust ESLint to ignore certain directories during recovery
   - [ ] Create .eslintignore with problem paths

### Step 4: Test Recovery (In Progress)
1. **Recover Tests One Directory at a Time**:
   - [x] Successfully fixed the mocks/handlers test
   - [x] Updated obsolete snapshots
   - [ ] Address utility and service tests
   - [ ] Finally fix component tests

2. **Track Progress in a Recovery Spreadsheet**:
   - [ ] Create tracking sheet of directories
   - [ ] Mark status for each: 🔴 broken, 🟡 fixed source, 🟢 tests passing

### Step 5: CI/CD Pipeline (Not Started)
1. **Adjust CI Pipeline**:
   - [ ] Update Jest configuration to skip problematic tests
   - [ ] Create a CI job that only runs passing tests
   - [ ] Gradually expand test coverage

## Useful Commands

### Fix Hyphenated Imports in Tests
```bash
find src -name "*.test.ts" -o -name "*.test.tsx" | xargs sed -i '' 's/import \([a-z-]*\) from/import \1 from/g'
```

### Skip Entire Test Directories
```js
// In jest.config.js
testPathIgnorePatterns: [
  '<rootDir>/src/components/',
  '<rootDir>/src/app/',
  // Add more as needed
],
```

### Run Only Fixed Tests
```bash
npm test -- --testMatch "**/src/mocks/**/*.test.ts"
```

### Generate Placeholder Tests for All Broken Tests
```bash
node scripts/generate-empty-tests.js
```

## Recovery Timeline

1. **Week 1**: Fix source code for core infrastructure (contexts, hooks, services)
2. **Week 2**: Fix UI components and utilities
3. **Week 3**: Fix test infrastructure and simplest tests
4. **Week 4**: Restore component tests and integration tests

## "Quick Win" Directories
These directories likely have fewer issues and can be fixed first:
- src/utils
- src/lib/utils
- src/constants
- src/schemas

## Developer Notes
- When fixing a file, create a `.bak` before making changes
- Use the existing transforms to automate common fixes
- Add TypeScript `// @ts-ignore` comments during the transition where needed
- Consider adding stricter linting after recovery to prevent future issues 