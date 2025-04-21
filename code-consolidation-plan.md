# Code Consolidation Plan

## Overview
This document outlines the approach for consolidating duplicate code implementations in the Vibewell project, with a focus on auth hooks, form validation utilities, and other core functionality.

## 1. Auth Hook Consolidation

### Current State
We have multiple auth hook implementations:
- `src/hooks/useAuth.ts` (already marked as deprecated)
- `src/hooks/use-auth.ts`
- `src/hooks/unified-auth.ts`
- `src/hooks/use-unified-auth.ts` (target implementation)

### Consolidation Steps
1. ✅ Mark legacy hooks as deprecated (completed for `useAuth.ts`)
2. Ensure `use-unified-auth.ts` has complete functionality from all hooks
3. Update `use-auth.ts` and `unified-auth.ts` to re-export from `use-unified-auth.ts`
4. Create a script to identify and update imports in components

### Implementation Timeline
- Day 1: Complete deprecation warnings and re-exports
- Days 2-3: Run update script and manually verify components
- Day 4: Final testing of auth functionality

## 2. Form Validation Consolidation

### Current State
Form validation logic exists in:
- `src/utils/form-validation.ts` (target implementation)
- Custom validation in various component files

### Consolidation Steps
1. Review `form-validation.ts` and ensure it covers all use cases
2. Add any missing validation patterns from component implementations
3. Create a migration guide for developers
4. Update components to use the centralized validation

### Implementation Timeline
- Day 1: Audit and enhance central validation utility
- Days 2-3: Update high-priority components
- Days 4-5: Update remaining components

## 3. API Types Consolidation

### Current State
API types are defined in:
- `src/types/api.ts` (target implementation)
- Scattered across service files

### Consolidation Steps
1. Review all API-related types across the codebase
2. Consolidate into the central types file
3. Update imports across the codebase

### Implementation Timeline
- Day 1: Complete type consolidation
- Day 2: Update imports and verify type usage

## 4. Migration Script

```javascript
// scripts/update-imports.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define import mappings: old import → new import
const importMappings = [
  {
    pattern: /import.*from ['"]@\/hooks\/useAuth['"]|import.*from ['"]@\/hooks\/use-auth['"]|import.*from ['"]@\/hooks\/unified-auth['"]/g,
    replacement: match => match.replace(/useAuth|use-auth|unified-auth/, 'use-unified-auth')
  },
  {
    pattern: /import.*from ['"]@\/lib\/auth['"]/g,
    replacement: match => match.replace('@/lib/auth', '@/hooks/use-unified-auth')
  },
  // Add more mappings as needed
];

function updateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    importMappings.forEach(({ pattern, replacement }) => {
      updatedContent = updatedContent.replace(pattern, replacement);
    });
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Find all TypeScript/JavaScript files
const findFiles = () => {
  const result = execSync(
    `find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`,
    { encoding: 'utf8' }
  );
  return result.split('\n').filter(Boolean);
};

// Main function
function main() {
  const files = findFiles();
  let updatedCount = 0;
  
  files.forEach(file => {
    const updated = updateImports(file);
    if (updated) updatedCount++;
  });
  
  console.log(`\nImport consolidation complete: Updated ${updatedCount} files.`);
}

main();
```

## 5. Monitoring Progress

We will track consolidation progress in the following table:

| Area | Status | Components Updated | Total Components | Progress |
|------|--------|-------------------|-----------------|----------|
| Auth Hooks | In Progress | 1 | ~50 | 2% |
| Form Validation | Not Started | 0 | ~30 | 0% |
| API Types | Not Started | 0 | ~20 | 0% |

## 6. Final Verification

Once consolidation is complete, we will:
1. Run the full test suite
2. Verify application functionality
3. Run TypeScript type checking
4. Create proper documentation for all standardized utilities 