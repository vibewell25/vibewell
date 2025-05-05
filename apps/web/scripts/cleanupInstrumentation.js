const fs = require('fs');
const path = require('path');

// Add monorepo root resolution
const MONOREPO_ROOT = path.resolve(__dirname, '../../../');

// Directories to skip during traversal
const SKIP_DIRS = ['node_modules', '.git', 'ios', 'android', 'coverage', 'dist', 'build', 'scripts', '__tests__', 'tests', 'test-archive'];

// Sweep the entire monorepo root for instrumentation code
const DIRS_TO_CLEAN = [MONOREPO_ROOT];

// Patterns to remove: instrumentation blocks and error throws
const patterns = [
  /\/\/\s*Safe[\s\S]*?\}\s*\n?/g,                                   // remove Safe blocks
  /if\s*\([^)]*(Number\.MAX_SAFE_INTEGER|Number\.MIN_SAFE_INTEGER|<\s*0|>=\s*array\.length)[^)]*\)\s*\{[\s\S]*?\}/g, // remove if overflow/array checks
  /^\s*throw new Error\('Integer overflow detected'\);\s*\n?/gm,       // remove throw statements
  /^\s*\}\s*\n?/gm,                                                     // remove orphan closing braces
  /import\s*\{[^}]*\}\s*from\s*['\"]vitest['\"];?\n/g,             // remove vitest imports
  /^\s*;\s*\n?/gm,                                                     // remove lines with only semicolon
  /^\s*,\s*\n?/gm,                                                     // remove lines with only comma
  /^\s*\)\s*;\s*\n?/gm,                                               // remove orphan closing parentheses
];

function cleanFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  if (/\.(test|spec)\.(js|jsx|ts|tsx)$/.test(filePath)) return;
  if (/jest\.setup\.(ts|tsx)$/.test(path.basename(filePath))) return;
  let updated = code;
  patterns.forEach((pattern) => {
    updated = updated.replace(pattern, '');
  });
  if (updated !== code) {
    // Strip everything before the first code declaration or import
    updated = updated.replace(/^[\s\S]*?(?=(?:import|const|class|function|module\.exports|export))/m, '');
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Cleaned instrumentation from ${filePath}`);
  }
}

function traverse(dir) {
  fs.readdirSync(dir).forEach((file) => {
    if (SKIP_DIRS.includes(file)) return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      cleanFile(fullPath);
    }
  });
}

console.log('Starting cleanup of instrumentation code...');
DIRS_TO_CLEAN.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`Traversing ${dir}`);
    traverse(dir);
  }
});
console.log('Cleanup complete.'); 