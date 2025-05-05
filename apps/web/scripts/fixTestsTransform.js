// @ts-nocheck
/* eslint-disable */

// jscodeshift codemod to clean up test syntax failures in TS/TSX tests.
// Usage: jscodeshift -t scripts/fixTestsTransform.js --extensions ts,tsx --parser tsx src/**/*.{test,spec}.{ts,tsx}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  let src = file.source;

  // 1) Strip everything before the first import
  const firstImportMatch = src.match(/\bimport\s/);
  if (firstImportMatch) {
    src = src.slice(firstImportMatch.index);
  }

  // 2) Remove ESLint disable/enable block comments
  src = src.replace(/\/\*\s*eslint-[\s\S]*?\*\//g, '');

  // Try AST-based clean up, fallback to raw src on error
  let code;
  try {
    const root = j(src);
    code = root.toSource({ quote: 'single' });
  } catch (err) {
    code = src;
  }

  // Regex-based cleanups for any remaining edge cases
  code = code
    // Collapse duplicate jest.mock closings
    .replace(/}\)\s*;\s*\n\s*}\)\s*;/g, '}));\n')
    // Fix orphan render calls ending with comma
    .replace(/render\(([^)]*?)\),\s*(?=\n)/g, 'render($1);\n')
    // Ensure semicolon before test lifecycle hooks or describe/it/test
    .replace(/([^;\s])\n(\s*(?:beforeEach|afterEach|test|it|describe)\()/g, '$1;\n$2')
    // Remove standalone commas or semicolons
    .replace(/^\s*[;,]\s*$/gm, '')
    // Remove stray closing braces or parentheses lines
    .replace(/^\s*\}\s*$/gm, '')
    .replace(/^\s*\)\s*;\s*$/gm, '')
    // Fix jest.mock closures missing extra parenthesis
    .replace(/(jest\.mock\([^,]+,\s*\(\)\s*=>\s*\(\{[\s\S]*?)\}\)\s*;/g, '$1}));')
    // Close interface blocks missing closing brace before function declarations
    .replace(/(interface\s+\w+\s*\{[\s\S]*?;)(\s*function\s+)/g, '$1}\n\n$2')
    // Remove stray standalone closing parentheses
    .replace(/^\s*\)\s*[,;]?$/gm, '');

  return code;
}; 