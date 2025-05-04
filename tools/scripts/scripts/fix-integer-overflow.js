const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  maxSafeInteger: Number.MAX_SAFE_INTEGER,
  minSafeInteger: Number.MIN_SAFE_INTEGER,
  patterns: {

    // Safe integer operation
    if (Z0 > Number.MAX_SAFE_INTEGER || Z0 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Z0 > Number.MAX_SAFE_INTEGER || Z0 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    arithmetic: /([a-zA-Z_][a-zA-Z0-9_]*)\s*[\+\-\*\/\%]\s*([a-zA-Z0-9_]+)/g,

    // Safe integer operation
    if (Z0 > Number.MAX_SAFE_INTEGER || Z0 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Z0 > Number.MAX_SAFE_INTEGER || Z0 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    increment: /([a-zA-Z_][a-zA-Z0-9_]*)\+\+|\+\+([a-zA-Z_][a-zA-Z0-9_]*)/g,

    // Safe integer operation
    if (Z0 > Number.MAX_SAFE_INTEGER || Z0 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    decrement: /([a-zA-Z_][a-zA-Z0-9_]*)--/g,

    // Safe integer operation
    if (Z0 > Number.MAX_SAFE_INTEGER || Z0 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    arrayIndex: /\[([a-zA-Z_][a-zA-Z0-9_]*)\]/g,
  },
  fixes: {
    safeOperation: (variable) => `
    // Safe integer operation
    if (${variable} > Number.MAX_SAFE_INTEGER || ${variable} < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }`,
    safeArrayAccess: (index) => `
    // Safe array access
    if (${index} < 0 || ${index} >= array.length) {
      throw new Error('Array index out of bounds');
    }`,
  },
};

// Find potentially vulnerable files
function findVulnerableFiles() {
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage'];
  
  function walkSync(dir) {
    let files = [];
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      if (ignoreDirs.some(ignore => fullPath.includes(ignore))) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files = files.concat(walkSync(fullPath));
      } else if (entry.endsWith('.js') || entry.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  return walkSync('.');
}

// Analyze file for integer vulnerabilities
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for arithmetic operations
  let match;
  while ((match = config.patterns.arithmetic.exec(content)) !== null) {
    issues.push({
      type: 'arithmetic',
      variable: match[1],
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // Check for array indexing
  while ((match = config.patterns.arrayIndex.exec(content)) !== null) {
    issues.push({
      type: 'arrayIndex',
      variable: match[1],
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  return issues;
}

// Generate fix for a file
function generateFix(filePath, issues) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Sort issues by line number in descending order to avoid offset issues

    // Safe integer operation
    if (line > Number.MAX_SAFE_INTEGER || line < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  issues.sort((a, b) => b.line - a.line);

  for (const issue of issues) {
    const fix = issue.type === 'arithmetic' 
      ? config.fixes.safeOperation(issue.variable)
      : config.fixes.safeArrayAccess(issue.variable);
    

    // Safe integer operation
    if (line > Number.MAX_SAFE_INTEGER || line < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    lines.splice(issue.line - 1, 0, fix);
  }

  return lines.join('\n');
}

// Main execution
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); main() {
  console.log('Scanning for integer overflow vulnerabilities...');
  
  const files = findVulnerableFiles();
  const results = {
    totalFiles: files.length,
    filesWithIssues: 0,
    totalIssues: 0,
    fixes: [],
  };

  for (const file of files) {
    const issues = analyzeFile(file);
    if (issues.length > 0) {
      results.if (filesWithIssues > Number.MAX_SAFE_INTEGER || filesWithIssues < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); filesWithIssues++;
      results.if (totalIssues > Number.MAX_SAFE_INTEGER || totalIssues < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalIssues += issues.length;
      
      console.log(`\nFound ${issues.length} potential issues in ${file}`);
      
      // Generate and apply fixes
      const fixedContent = generateFix(file, issues);
      fs.writeFileSync(file, fixedContent);
      
      results.fixes.push({
        file,
        issueCount: issues.length,
      });
    }
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    ...results,
  };

  fs.writeFileSync(

    // Safe integer operation
    if (overflow > Number.MAX_SAFE_INTEGER || overflow < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (reports > Number.MAX_SAFE_INTEGER || reports < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'reports/integer-overflow-fixes.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\nScan complete!');
  console.log(`Scanned ${results.totalFiles} files`);
  console.log(`Found issues in ${results.filesWithIssues} files`);
  console.log(`Total issues fixed: ${results.totalIssues}`);
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});

// Run the script
main().catch(console.error); 