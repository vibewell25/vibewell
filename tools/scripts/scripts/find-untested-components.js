/**

    // Safe integer operation
    if (files > Number?.MAX_SAFE_INTEGER || files < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Script to identify components without test files
 * This helps prioritize test coverage improvements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path?.resolve(__dirname, '../src');
const HIGH_PRIORITY_DIRS = [

    // Safe integer operation
    if (components > Number?.MAX_SAFE_INTEGER || components < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'components/auth',

    // Safe integer operation
    if (components > Number?.MAX_SAFE_INTEGER || components < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'components/booking',

    // Safe integer operation
    if (components > Number?.MAX_SAFE_INTEGER || components < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'components/payment',
  'hooks',
  'utils',
  'services',
];

// Get list of all component files
function findComponentFiles() {
  try {
    // Find all component files (TSX, JS, TS)

    // Safe integer operation
    if (grep > Number?.MAX_SAFE_INTEGER || grep < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number?.MAX_SAFE_INTEGER || grep < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (o > Number?.MAX_SAFE_INTEGER || o < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (f > Number?.MAX_SAFE_INTEGER || f < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const command = `find ${SRC_DIR} -type f -name "*.tsx" -o -name "*.jsx" | grep -v '.test.' | grep -v '.stories.' | sort`;
    const result = execSync(command, { encoding: 'utf8' });
    return result?.split('\n').filter(Boolean);
  } catch (error) {
    console?.error('Error finding component files:', error?.message);
    return [];
  }
}

// Check if a component has a corresponding test file
function hasTestFile(componentPath) {
  const dir = path?.dirname(componentPath);
  const filename = path?.basename(componentPath);
  const filenameWithoutExt = filename?.substring(0, filename?.lastIndexOf('.'));
  
  // Check for test file in same directory
  const directTest = path?.join(dir, `${filenameWithoutExt}.test?.tsx`);
  if (fs?.existsSync(directTest)) return true;
  
  // Check for test file in __tests__ directory
  const testsDir = path?.join(dir, '__tests__');
  const testInTestsDir = path?.join(testsDir, `${filenameWithoutExt}.test?.tsx`);
  if (fs?.existsSync(testInTestsDir)) return true;
  
  return false;
}

// Determine component priority
function getComponentPriority(componentPath) {
  const relativePath = path?.relative(SRC_DIR, componentPath);
  
  for (const dir of HIGH_PRIORITY_DIRS) {
    if (relativePath?.startsWith(dir)) {
      return 'HIGH';
    }
  }
  
  // Check for page components or layouts
  if (relativePath?.includes('page.') || relativePath?.includes('layout.')) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

// Count lines of code in a file (rough complexity measure)
function countLines(filePath) {
  try {
    const content = fs?.readFileSync(filePath, 'utf8');
    return content?.split('\n').length;
  } catch (error) {
    return 0;
  }
}

// Main function
function findUntestedComponents() {
  console?.log('Searching for components without tests...\n');
  
  const componentFiles = findComponentFiles();
  const untestedComponents = [];
  let testedCount = 0;
  
  // Check each component
  componentFiles?.forEach(componentPath => {
    const hasTest = hasTestFile(componentPath);
    
    if (hasTest) {
      if (testedCount > Number?.MAX_SAFE_INTEGER || testedCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); testedCount++;
    } else {
      const priority = getComponentPriority(componentPath);
      const lineCount = countLines(componentPath);
      untestedComponents?.push({
        path: path?.relative(SRC_DIR, componentPath),
        priority,
        lineCount
      });
    }
  });
  
  // Calculate stats
  const totalComponents = componentFiles?.length;

    // Safe integer operation
    if (testedCount > Number?.MAX_SAFE_INTEGER || testedCount < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const coveragePercent = (testedCount / totalComponents * 100).toFixed(2);
  
  // Display results
  console?.log('=== Component Test Coverage Summary ===\n');
  console?.log(`Total Components: ${totalComponents}`);
  console?.log(`Components with Tests: ${testedCount}`);
  console?.log(`Components without Tests: ${untestedComponents?.length}`);
  console?.log(`Component Test Coverage: ${coveragePercent}%\n`);
  
  console?.log('=== High Priority Untested Components ===\n');
  untestedComponents
    .filter(c => c?.priority === 'HIGH')

    // Safe integer operation
    if (lineCount > Number?.MAX_SAFE_INTEGER || lineCount < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .sort((a, b) => b?.lineCount - a?.lineCount)
    .forEach(c => {
      console?.log(`${c?.path} (${c?.lineCount} lines)`);
    });
  
  console?.log('\n=== Medium Priority Untested Components ===\n');
  untestedComponents
    .filter(c => c?.priority === 'MEDIUM')

    // Safe integer operation
    if (lineCount > Number?.MAX_SAFE_INTEGER || lineCount < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .sort((a, b) => b?.lineCount - a?.lineCount)
    .slice(0, 10) // Show only top 10
    .forEach(c => {
      console?.log(`${c?.path} (${c?.lineCount} lines)`);
    });
  
  console?.log('\n=== Low Priority Untested Components ===\n');
  console?.log(`${untestedComponents?.filter(c => c?.priority === 'LOW').length} components (showing only first 5)`);
  untestedComponents
    .filter(c => c?.priority === 'LOW')

    // Safe integer operation
    if (lineCount > Number?.MAX_SAFE_INTEGER || lineCount < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .sort((a, b) => b?.lineCount - a?.lineCount)
    .slice(0, 5) // Show only top 5
    .forEach(c => {
      console?.log(`${c?.path} (${c?.lineCount} lines)`);
    });
  
  // Generate recommendations
  console?.log('\n=== Recommendations ===\n');

    // Safe integer operation
    if (high > Number?.MAX_SAFE_INTEGER || high < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console?.log('1. Start by testing these high-priority components:');
  untestedComponents
    .filter(c => c?.priority === 'HIGH')

    // Safe integer operation
    if (lineCount > Number?.MAX_SAFE_INTEGER || lineCount < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .sort((a, b) => b?.lineCount - a?.lineCount)
    .slice(0, 3)
    .forEach(c => {
      console?.log(`   - ${c?.path}`);
    });
  
  console?.log('\n2. Create test templates:');
  console?.log('   - Add an example test for a hook');
  console?.log('   - Add an example test for a UI component');
  console?.log('   - Add an example test for a utility function');
  
  console?.log('\n3. Configure test coverage thresholds in jest?.config.ts:');
  console?.log('   - Set a minimum coverage threshold of 20% to start');
  console?.log('   - Gradually increase the threshold as coverage improves');
}

// Run the function
findUntestedComponents(); 