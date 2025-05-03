#!/usr/bin/env node

/**
 * Documentation Fix Script
 * 
 * This script fixes common documentation issues:
 * 1. Updates broken links between documentation files
 * 2. Updates references to implementation files
 * 3. Standardizes component references
 * 
 * Usage:
 *   node scripts/fix-documentation.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  docsDir: path.join(process.cwd(), 'docs'),
  ignoreDirs: [
    'node_modules',
    '.next',
    'build',
    'dist',
    'coverage',
  ],
  fileExtensions: ['.md', '.mdx'],
  // Common broken links and their replacements
  linkReplacements: {
    'docs/redis-config.md': 'docs/redis-production-config.md',
    'redis-config.md': 'redis-production-config.md',
    'implementation-summary.md': 'IMPLEMENTATION.md',
    // Add more common replacements here
  },
  // File path corrections (absolute paths that might be incorrect)
  pathCorrections: {
    'src/components/base/Button': 'src/components/ui/Button',
    'src/components/base/Input': 'src/components/ui/Input',
    'src/components/base/Card': 'src/components/ui/Card',
    'src/components/ui/button': 'src/components/ui/Button',
    'src/components/ui/input': 'src/components/ui/Input',
    'src/components/ui/card': 'src/components/ui/Card',
    // Add more path corrections here
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const isCiMode = args.includes('--ci');
const isVerbose = args.includes('--verbose');

// Collect all documentation files
function getAllDocFiles() {
  let docFiles = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !CONFIG.ignoreDirs.includes(file)) {
        scanDirectory(filePath);
      } else if (
        stat.isFile() && 
        CONFIG.fileExtensions.includes(path.extname(file).toLowerCase())
      ) {
        docFiles.push(filePath);
      }
    });
  }
  
  scanDirectory(CONFIG.docsDir);
  return docFiles;
}

// Fix links in markdown content
function fixLinks(content) {
  let fixedContent = content;
  
  // Replace common broken links
  Object.entries(CONFIG.linkReplacements).forEach(([oldLink, newLink]) => {
    // Replace links in format [text](link)
    const markdownLinkRegex = new RegExp(`\\[([^\\]]+)\\]\\(${oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^)]*)\\)`, 'g');
    fixedContent = fixedContent.replace(markdownLinkRegex, `[$1](${newLink}$2)`);
    
    // Replace links in format `link`
    const codeLinkRegex = new RegExp(`\`${oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``, 'g');
    fixedContent = fixedContent.replace(codeLinkRegex, `\`${newLink}\``);
  });
  
  // Correct file paths in code examples
  Object.entries(CONFIG.pathCorrections).forEach(([oldPath, newPath]) => {
    const pathRegex = new RegExp(`${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    fixedContent = fixedContent.replace(pathRegex, newPath);
  });
  
  return fixedContent;
}

// Fix implementation references
function fixImplementationReferences(content) {
  let fixedContent = content;
  
  // Fix RedisClient references
  const redisClientPattern = /RedisClient(?! implements)/g;
  fixedContent = fixedContent.replace(redisClientPattern, 'RedisClientInterface');
  
  // Fix asyncIncr method references to match actual implementation
  fixedContent = fixedContent.replace(/async asyncIncr/g, 'async incr');
  
  // Fix other method names
  fixedContent = fixedContent.replace(/async getRateLimit/g, 'async getRateLimitEvents');
  
  return fixedContent;
}

// Fix component documentation
function fixComponentDocs(content) {
  let fixedContent = content;
  
  // Update component imports from older patterns to new ones
  fixedContent = fixedContent.replace(/import \{ (\w+) \} from ["']src\/components\/ui\/(\w+)["']/g, 'import { $1 } from "@/components/ui/$2"');
  fixedContent = fixedContent.replace(/import \{ (\w+) \} from ["']components\/ui\/(\w+)["']/g, 'import { $1 } from "@/components/ui/$2"');
  
  // Fix component references in examples
  const componentClassPattern = /className=\{([^}]+)\}/g;
  fixedContent = fixedContent.replace(componentClassPattern, match => {
    // Replace dynamic class references with cn() utility
    if (match.includes('${') || match.includes('?')) {
      return match.replace('className={', 'className={cn(');
    }
    return match;
  });
  
  return fixedContent;
}

// Create component implementation summaries for missing documentation
function createComponentSummary(componentName) {
  const componentPath = path.join(CONFIG.rootDir, 'src', 'components', 'ui', `${componentName}.tsx`);
  
  if (!fs.existsSync(componentPath)) {
    return null;
  }
  
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  
  // Extract JSDoc description
  const descRegex = /\/\*\*[\s\S]*?\* Description: ([^\n]*)/;
  const descMatch = componentContent.match(descRegex);
  const description = descMatch ? descMatch[1].trim() : `${componentName} component`;
  
  // Extract props
  const propsRegex = /export interface (\w+)Props[\s\S]*?\{([\s\S]*?)\}/;
  const propsMatch = componentContent.match(propsRegex);
  const props = propsMatch ? propsMatch[2]
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('//'))
    .map(line => {
      const trimmedLine = line.trim();
      const propMatch = trimmedLine.match(/(\w+)(\?)?:\s*(.*);/);
      if (propMatch) {
        const [, propName, optional, propType] = propMatch;
        return `| \`${propName}\` | ${propType.replace(/\|/g, 'or')} | ${optional ? 'Optional' : 'Required'} | |`;
      }
      return null;
    })
    .filter(Boolean)
    .join('\n') : '';
  
  return `# ${componentName} Component

${description}

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
${props}

## Example Usage

\`\`\`tsx
import { ${componentName} } from "@/components/ui/${componentName}";

// Example usage
<${componentName} 
  // Add appropriate props here
/>
\`\`\`

## Notes

This component is part of the standardized UI component library. Always import it from \`@/components/ui\` to ensure consistency across the application.
`;
}

// Main function
function fixDocumentation() {
  console.log('Starting documentation fixes...');
  
  const docFiles = getAllDocFiles();
  console.log(`Found ${docFiles.length} documentation files to process`);
  
  let filesFixed = 0;
  
  // Process each file
  docFiles.forEach(filePath => {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    
    // Apply fixes
    let fixedContent = fixLinks(originalContent);
    fixedContent = fixImplementationReferences(fixedContent);
    fixedContent = fixComponentDocs(fixedContent);
    
    // Only write back if content changed
    if (fixedContent !== originalContent) {
      fs.writeFileSync(filePath, fixedContent);
      filesFixed++;
      console.log(`Fixed issues in: ${path.relative(CONFIG.rootDir, filePath)}`);
    }
  });
  
  console.log(`Fixed issues in ${filesFixed} files`);
  
  // Create missing component documentation
  const standardComponents = ['Button', 'Input', 'Card', 'Checkbox', 'Select'];
  let docsCreated = 0;
  
  standardComponents.forEach(component => {
    const docFilePath = path.join(CONFIG.docsDir, 'components', `${component.toLowerCase()}.md`);
    
    // Create components directory if it doesn't exist
    if (!fs.existsSync(path.dirname(docFilePath))) {
      fs.mkdirSync(path.dirname(docFilePath), { recursive: true });
    }
    
    // Only create file if it doesn't exist or is empty
    if (!fs.existsSync(docFilePath) || fs.readFileSync(docFilePath, 'utf-8').trim() === '') {
      const summary = createComponentSummary(component);
      if (summary) {
        fs.writeFileSync(docFilePath, summary);
        docsCreated++;
        console.log(`Created documentation for: ${component}`);
      }
    }
  });
  
  console.log(`Created documentation for ${docsCreated} components`);
  
  // Run verification to check for any remaining issues
  console.log('\nRunning verification to check for remaining issues...');
  try {
    if (isCiMode) {
      // In CI mode, don't call the verification script directly
      console.log('Skipping verification in CI mode - will be done in the next step');
    } else {
      execSync('node scripts/verify-documentation.js', { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('Documentation still has some issues. Manual review recommended.');
    if (isCiMode) {
      process.exitCode = 1;
    }
  }
}

// Run the fix
fixDocumentation(); 