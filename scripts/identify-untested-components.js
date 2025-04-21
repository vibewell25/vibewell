/**
 * Script to identify components that don't have corresponding test files.
 * This helps prioritize which components need testing.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Components directories to scan
const COMPONENT_DIRS = [
  'src/components',
  'src/components/ui',
  'src/components/common',
  'src/components/layout',
];

// Test file patterns to look for
const TEST_FILE_PATTERNS = ['.test.tsx', '.test.ts', '.spec.tsx', '.spec.ts'];

// File extensions to consider as components
const COMPONENT_EXTENSIONS = ['.tsx', '.ts'];
// Files to ignore
const IGNORE_FILES = [
  'index.ts',
  'index.tsx',
  'types.ts',
  'utils.ts',
  'constants.ts',
  'helpers.ts',
];

/**
 * Recursively get all files in a directory
 */
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat();
}

/**
 * Check if a component has a test file
 */
function hasTestFile(componentPath, allFiles) {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  
  // Check for test files in various formats and locations
  const possibleTestPaths = [
    // Same directory
    ...TEST_FILE_PATTERNS.map(pattern => 
      path.join(path.dirname(componentPath), `${componentName}${pattern}`)
    ),
    // __tests__ directory within same directory
    ...TEST_FILE_PATTERNS.map(pattern => 
      path.join(path.dirname(componentPath), '__tests__', `${componentName}${pattern}`)
    ),
    // src/__tests__ directory with similar path structure
    ...TEST_FILE_PATTERNS.map(pattern => {
      const relativePath = path.relative(path.join(process.cwd(), 'src'), path.dirname(componentPath));
      return path.join(process.cwd(), 'src', '__tests__', relativePath, `${componentName}${pattern}`);
    })
  ];

  return possibleTestPaths.some(testPath => allFiles.includes(testPath));
}

/**
 * Main function
 */
async function main() {
  try {
    // Get all files in the project
    let allFiles = [];
    for (const dir of COMPONENT_DIRS) {
      if (fs.existsSync(dir)) {
        const files = await getFiles(path.join(process.cwd(), dir));
        allFiles = allFiles.concat(files);
      }
    }
    
    // Get additional test files from src/__tests__ directory
    if (fs.existsSync(path.join(process.cwd(), 'src', '__tests__'))) {
      const testFiles = await getFiles(path.join(process.cwd(), 'src', '__tests__'));
      allFiles = allFiles.concat(testFiles);
    }

    // Find component files
    const componentFiles = allFiles.filter(file => {
      const ext = path.extname(file);
      const basename = path.basename(file);
      
      // Only include files with component extensions
      if (!COMPONENT_EXTENSIONS.includes(ext)) return false;
      
      // Exclude test files
      if (TEST_FILE_PATTERNS.some(pattern => file.includes(pattern))) return false;
      
      // Exclude ignored files
      if (IGNORE_FILES.includes(basename)) return false;
      
      // Check if the file might be a component (React component pattern)
      const content = fs.readFileSync(file, 'utf8');
      return (
        content.includes('React') &&
        (content.includes('export function') || 
         content.includes('export default') ||
         content.includes('export const') ||
         content.includes('React.FC') ||
         content.includes('React.Component'))
      );
    });
    
    // Find components without test files
    const untestedComponents = componentFiles.filter(
      componentPath => !hasTestFile(componentPath, allFiles)
    );
    
    // Sort by directories to identify areas that need most work
    const untestedByDirectory = untestedComponents.reduce((acc, file) => {
      const dir = path.dirname(file);
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(path.basename(file));
      return acc;
    }, {});
    
    // Sort directories by number of untested components
    const sortedDirs = Object.keys(untestedByDirectory).sort(
      (a, b) => untestedByDirectory[b].length - untestedByDirectory[a].length
    );
    
    console.log(`Found ${untestedComponents.length} components without tests out of ${componentFiles.length} total components (${((untestedComponents.length / componentFiles.length) * 100).toFixed(2)}% untested)\n`);
    
    console.log('Top directories needing tests:');
    for (const dir of sortedDirs.slice(0, 10)) {
      console.log(`${dir}: ${untestedByDirectory[dir].length} untested components`);
      untestedByDirectory[dir].forEach(file => {
        console.log(`  - ${file}`);
      });
      console.log('');
    }
    
    console.log('\nAll untested components:');
    untestedComponents.forEach(file => {
      console.log(file);
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 