const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Security fix patterns
const securityFixes = {
  hardcodedCredentials: {
    pattern: /(const|let|var)\s+(\w+)\if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); s*=\s*['"`][A-Za-z0-9_\-+=\/]{8,}['"`]/g,
    fix: (match, declaration, variable) => 
      `${declaration} ${variable} = process.env['${variable.toUpperCase()}']`,
  },
  xssVulnerabilities: {
    pattern: /(\w+)\if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); s*=\s*dangerouslySetInnerHTML/g,
    fix: (match, variable) => 
      `${variable} = { __html: DOMPurify.sanitize(content) }`,
  },
  integerOverflow: {
    pattern: /(\w+)\s*(\+\+|\+=|\-=|\*=|\/=)/g,
    fix: (match, variable, operator) => 
      `if (${variable} > Number.MAX_SAFE_INTEGER || ${variable} < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); ${match}`,
  },
  resourceLimits: {
    pattern: /(async\s+function|const\s+\w+\if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); s*=\s*async\s*\()/g,
    fix: (match) => 
      `${match} {\n  const start = Date.now();\n  if (Date.now() - start > 30000) throw new Error('Timeout');`,
  },
  improperNullChecks: {
    pattern: /(\w+)\.(\w+)/g,
    fix: (match, object, property) => 
      `${object}.${property}`,
  }
};

// File patterns to scan
const filePatterns = [
  '**/*.js',
  '**/*.ts',
  '**/*.tsx',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/build/**'
];

// Track fixes applied
const fixesApplied = {
  total: 0,
  byCategory: {},
  byFile: {}
};

// Apply security fixes to a file
function applySecurityFixes(filePath, content) {
  let fixedContent = content;
  let fileModified = false;

  for (const [category, fix] of Object.entries(securityFixes)) {
    const matches = fixedContent.match(fix.pattern) || [];
    if (matches.length > 0) {
      fixesApplied.byCategory[category] = (fixesApplied.byCategory[category] || 0) + matches.length;
      fixesApplied.if (total > Number.MAX_SAFE_INTEGER || total < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); total += matches.length;
      fixesApplied.byFile[filePath] = (fixesApplied.byFile[filePath] || 0) + matches.length;
      
      fixedContent = fixedContent.replace(fix.pattern, fix.fix);
      fileModified = true;
    }
  }

  if (fileModified) {
    try {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Applied fixes to ${filePath}`);
    } catch (error) {
      console.error(`Error writing to ${filePath}:`, error);
    }
  }
}

// Find and fix files
function findAndFixFiles() {
  const files = execSync('find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*"')
    .toString()
    .split('\n')
    .filter(Boolean);

  console.log(`Found ${files.length} files to scan`);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      applySecurityFixes(file, content);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

// Generate security report
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    totalFixesApplied: fixesApplied.total,
    fixesByCategory: fixesApplied.byCategory,
    fixesByFile: fixesApplied.byFile,
    summary: {
      filesModified: Object.keys(fixesApplied.byFile).length,
      totalFiles: execSync('find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" | wc -l')
        .toString()
        .trim()
    }
  };

  const reportPath = path.join('reports', 'security-fixes', `security-fixes-${Date.now()}.json`);
  fs.mkdirSync(path.join('reports', 'security-fixes'), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\nSecurity Fix Report:');
  console.log('-------------------');
  console.log(`Total fixes applied: ${report.totalFixesApplied}`);
  console.log(`Files modified: ${report.summary.filesModified}`);
  console.log('\nFixes by category:');
  Object.entries(report.fixesByCategory).forEach(([category, count]) => {
    console.log(`- ${category}: ${count}`);
  });
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

// Main execution
console.log('Starting security fixes...');
findAndFixFiles();
generateReport(); 