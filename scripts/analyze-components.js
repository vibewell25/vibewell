const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMPONENT_DIR = path.join(process.cwd(), 'src/components');
const SIZE_THRESHOLD = 50 * 1024; // 50KB
const DEPENDENCIES_THRESHOLD = 10;

function getComponentSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function getDependencies(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importLines = content.match(/^import.*from.*/gm) || [];
    return importLines.length;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return 0;
  }
}

function analyzeComponents(dir) {
  const results = [];

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);

    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        traverse(filePath);
      } else if (file.match(/\.(tsx|jsx)$/)) {
        const size = getComponentSize(filePath);
        const dependencies = getDependencies(filePath);
        const relativePath = path.relative(COMPONENT_DIR, filePath);

        if (size > SIZE_THRESHOLD || dependencies > DEPENDENCIES_THRESHOLD) {
          results.push({
            component: relativePath,
            size: (size / 1024).toFixed(2) + ' KB',
            dependencies,
            recommendation: 'Should be loaded dynamically',
          });
        }
      }
    });
  }

  traverse(dir);
  return results;
}

// Run the analysis
console.log('Analyzing components...\n');
const results = analyzeComponents(COMPONENT_DIR);

if (results.length > 0) {
  console.log('Components that should be loaded dynamically:');
  console.table(results);
  
  console.log('\nExample dynamic import implementation:');
  console.log(`
import { dynamicImport } from '@/utils/dynamicImport';

// Replace ComponentName with the actual component name
const DynamicComponent = dynamicImport(() => 
  import('@/components/path/to/Component')
);
  `);
} else {
  console.log('No components found that need dynamic loading.');
}

// Add a note about the criteria
console.log('\nCriteria for dynamic loading:');
console.log(`- Component size > ${SIZE_THRESHOLD / 1024}KB`);
console.log(`- Number of dependencies > ${DEPENDENCIES_THRESHOLD}`); 