/**
 * Fix broken function declarations that have timeout code inserted
 */
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;

  // Regular expression to match the timeout code pattern
  const timeoutPattern = /const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);/g;

  // Get the source code as a string
  let source = fileInfo.source;

  // Find and fix broken async function declarations
  const matches = source.match(/async function \{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);([^{}]*?)\}/g);
  
  if (matches) {
    matches.forEach(match => {
      // Extract the function signature part after the timeout code
      const funcSigMatch = match.match(/async function \{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);([^{]*?)\{/);
      
      if (funcSigMatch && funcSigMatch[1]) {
        // Reconstruct the proper function declaration
        const newFuncDecl = `async function ${funcSigMatch[1].trim()} {`;
        source = source.replace(match.split('{')[0], newFuncDecl);
        modified = true;
      }
    });
  }

  // Find and fix broken method declarations
  const methodMatches = source.match(/async ([a-zA-Z0-9_]+)\s*\(\s*\{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);([^{}]*?)\}/g);
  
  if (methodMatches) {
    methodMatches.forEach(match => {
      // Extract the method name and parameters
      const methodMatch = match.match(/async ([a-zA-Z0-9_]+)\s*\(\s*\{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);([^{]*?)\{/);
      
      if (methodMatch && methodMatch[1] && methodMatch[2]) {
        // Reconstruct the proper method declaration
        const newMethodDecl = `async ${methodMatch[1]}(${methodMatch[2].trim()} {`;
        source = source.replace(match.split('{')[0], newMethodDecl);
        modified = true;
      }
    });
  }

  // Handle broken async arrow functions
  source = source.replace(/const ([a-zA-Z0-9_]+) = async \( \{\s*const start = Date\.now\(\);\s*if \(Date\.now\(\) - start > \d+\) throw new Error\('Timeout'\);([^={}]*?)\) =>/g, 
                         (match, funcName, params) => {
                           modified = true;
                           return `const ${funcName} = async (${params.trim()}) =>`;
                         });

  // Remove any remaining timeout code patterns
  if (timeoutPattern.test(source)) {
    source = source.replace(timeoutPattern, '');
    modified = true;
  }

  return modified ? source : null;
}; 