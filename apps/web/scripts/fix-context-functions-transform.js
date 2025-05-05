/**
 * Fix broken context function declarations with timeout code
 */
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;
  
  // Get source as string for regex operations
  let source = fileInfo.source;
  
  // Fix broken async arrow functions in contexts
  const arrowFunctionPattern = /const\s+(\w+)\s*=\s*async\s*\(\s*\{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);\s*([^)]*)\)\s*=>\s*\{/g;
  
  source = source.replace(arrowFunctionPattern, (match, funcName, params) => {
    modified = true;
    return `const ${funcName} = async (${params.trim()}) => {`;
  });
  
  // Fix auth provider login/logout functions with embedded timeout checks
  source = source.replace(
    /const\s+(login|logout|register|updateUser|resetPassword|verifyEmail|refreshToken|sendPasswordReset)\s*=\s*async\s*\(\s*\{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);\s*([^)]*)\)\s*=>\s*\{/g,
    (match, funcName, params) => {
      modified = true;
      return `const ${funcName} = async (${params.trim()}) => {`;
    }
  );
  
  // Fix broken method declarations in classes
  source = source.replace(
    /async\s+(\w+)\s*\(\s*\{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);\s*([^)]*)\)\s*\{/g,
    (match, methodName, params) => {
      modified = true;
      return `async ${methodName}(${params.trim()}) {`;
    }
  );
  
  // Remove standalone timeout checks
  source = source.replace(
    /const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);/g,
    () => {
      modified = true;
      return '';
    }
  );
  
  // Find specific broken component functions from context declarations
  // This targets useEffect, useCallback functions
  source = source.replace(
    /useEffect\(\(\) => \{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);/g,
    () => {
      modified = true;
      return 'useEffect(() => {';
    }
  );
  
  source = source.replace(
    /useCallback\(\(\) => \{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);/g,
    () => {
      modified = true;
      return 'useCallback(() => {';
    }
  );
  
  // Return modified source if changes were made
  return modified ? source : null;
}; 