const fs = require('fs');
const path = require('path');

// Root of tests to clean
const ROOT = path.resolve(__dirname, '../src');
const TEST_FILE_REGEX = /\.(test|spec)\.(ts|tsx)$/;

// Recursively traverse directories
function traverse(dir) {
  fs.readdirSync(dir).forEach((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (TEST_FILE_REGEX.test(entry)) {
      let code = fs.readFileSync(fullPath, 'utf8');
      let updated = code;

      // 1) Strip everything before the first import (including stray comment closures)
      updated = updated.replace(/^[\s\S]*?import\s/m, 'import ');

      // 2) Remove any ESLint disable/enable block comments
      updated = updated.replace(/\/\*\s*eslint-[\s\S]*?\*\//g, '');

      // 3) Collapse duplicate jest.mock closings: '});\n});' → '}));'
      updated = updated.replace(/}\)\s*;\s*\n\s*}\)\s*;/g, '}));');

      // 4) Fix orphan closing of render calls that end with a comma or missing semicolon
      //    e.g. render(<X>...</X>,  → render(<X>...</X>);
      updated = updated.replace(/render\(([^)]*?)\),(\s*?)(?=\n)/g, 'render($1);$2');
      updated = updated.replace(/render\(([^)]*?)\)(?=\s*\n[^;])/g, 'render($1);');

      // 5) Remove standalone commas or semicolons on their own lines
      updated = updated.replace(/^\s*[;,]\s*$/gm, '');

      // 6) Remove stray orphan closing braces/parentheses
      updated = updated.replace(/^\s*\}\s*$/gm, '');
      updated = updated.replace(/^\s*\)\s*;\s*$/gm, '');

      // 7) Fix jest.mock closures missing extra parenthesis
      updated = updated.replace(/(jest\.mock\([^,]+,\s*\(\)\s*=>\s*\(\{[\s\S]*?)\}\)\s*;/g, '$1}));');

      // 8) Insert missing semicolons before test/beforeEach/it/describe declarations
      updated = updated.replace(/([^;\s])\s*\n(\s*(?:beforeEach|afterEach|test|it|describe)\()/g, '$1;\n$2');

      // 9) Close interface blocks missing brace before function declarations
      updated = updated.replace(/(interface\s+\w+\s*\{[\s\S]*?;)(\s*function\s+)/g, '$1}\n\n$2');

      // 10) Remove stray standalone closing parentheses
      updated = updated.replace(/^\s*\)\s*[,;]?$/gm, '');

      if (updated !== code) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Cleaned syntax in: ${path.relative(process.cwd(), fullPath)}`);
      }
    }
  });
}

console.log('Starting comprehensive test syntax cleanup...');
traverse(ROOT);
console.log('Cleanup complete.'); 