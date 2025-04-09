#!/usr/bin/env node

/**
 * Vibewell Accessibility Implementation Script
 * This script helps implement the accessibility fixes across the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define source and target directories
const accessibilityDir = path.join(process.cwd(), 'accessibility');
const srcDir = path.join(process.cwd(), 'src');
const componentsDir = path.join(srcDir, 'components');
const uiDir = path.join(componentsDir, 'ui');

// Ensure UI directory exists
if (!fs.existsSync(uiDir)) {
  fs.mkdirSync(uiDir, { recursive: true });
}

// Copy accessibility components to the project
const copyComponents = () => {
  console.log('Copying accessibility components...');
  
  const componentSources = [
    { 
      src: path.join(accessibilityDir, 'components', 'SkipLink.tsx'),
      dest: path.join(componentsDir, 'SkipLink.tsx') 
    },
    { 
      src: path.join(accessibilityDir, 'components', 'ScreenReaderText.tsx'),
      dest: path.join(componentsDir, 'ScreenReaderText.tsx') 
    },
    { 
      src: path.join(accessibilityDir, 'components', 'LiveAnnouncer.tsx'),
      dest: path.join(componentsDir, 'LiveAnnouncer.tsx') 
    },
    { 
      src: path.join(accessibilityDir, 'components', 'AccessibleDialog.tsx'),
      dest: path.join(componentsDir, 'AccessibleDialog.tsx') 
    },
    { 
      src: path.join(accessibilityDir, 'components', 'FormErrorMessage.tsx'),
      dest: path.join(componentsDir, 'FormErrorMessage.tsx') 
    },
    { 
      src: path.join(accessibilityDir, 'components', 'AccessibleIcon.tsx'),
      dest: path.join(componentsDir, 'AccessibleIcon.tsx') 
    }
  ];
  
  componentSources.forEach(({ src, dest }) => {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${path.basename(src)} to ${dest}`);
  });
};

// Update layout component to add skip link
const updateLayout = () => {
  console.log('Updating layout with skip link...');
  
  const layoutPaths = [
    path.join(srcDir, 'app', 'layout.tsx'),
    path.join(srcDir, 'components', 'layout', 'Layout.tsx')
  ];
  
  let layoutUpdated = false;
  
  for (const layoutPath of layoutPaths) {
    if (fs.existsSync(layoutPath)) {
      let content = fs.readFileSync(layoutPath, 'utf8');
      
      // Check if the file already has a skip link
      if (!content.includes('SkipLink')) {
        // Add import
        content = content.replace(
          /(import.*from.[^;]*;)/,
          `\nimport SkipLink from '@/components/SkipLink';`
        );
        
        // Add skip link component
        content = content.replace(
          /(<body[^>]*>)([\s\S]*?)(<.*?main[^>]*>)/m,
          `\n      <SkipLink targetId="main-content" />`
        );
        
        // Add ID to main content
        content = content.replace(
          /(<main[^>]*)>/,
          ` id="main-content">`
        );
        
        fs.writeFileSync(layoutPath, content);
        console.log(`Updated ${layoutPath} with skip link`);
        layoutUpdated = true;
        break;
      } else {
        console.log(`Skip link already exists in ${layoutPath}`);
        layoutUpdated = true;
        break;
      }
    }
  }
  
  if (!layoutUpdated) {
    console.warn('Could not find layout file to update. Please add SkipLink manually.');
  }
};

// Add focus styles to global CSS
const updateGlobalStyles = () => {
  console.log('Updating global styles with accessibility improvements...');
  
  const globalStylePaths = [
    path.join(srcDir, 'app', 'globals.css'),
    path.join(srcDir, 'styles', 'globals.css')
  ];
  
  let stylesUpdated = false;
  
  for (const stylePath of globalStylePaths) {
    if (fs.existsSync(stylePath)) {
      let content = fs.readFileSync(stylePath, 'utf8');
      const focusStyles = fs.readFileSync(path.join(accessibilityDir, 'fixes', 'focus-styles.css'), 'utf8');
      
      if (!content.includes('Enhanced focus styles for better keyboard navigation')) {
        content += `\n\n/* Accessibility Improvements */\n${focusStyles}`;
        fs.writeFileSync(stylePath, content);
        console.log(`Updated ${stylePath} with accessibility styles`);
        stylesUpdated = true;
        break;
      } else {
        console.log(`Accessibility styles already exist in ${stylePath}`);
        stylesUpdated = true;
        break;
      }
    }
  }
  
  if (!stylesUpdated) {
    console.warn('Could not find global styles file. Please add focus styles manually.');
  }
};

// Fix color contrast issues
const fixColorContrast = () => {
  console.log('Fixing color contrast issues...');
  
  try {
    execSync('node accessibility/fixes/fix-color-contrast.js', { stdio: 'inherit' });
    console.log('Color contrast issues fixed');
  } catch (error) {
    console.error('Error fixing color contrast:', error.message);
  }
};

// Add LiveAnnouncer to app
const addLiveAnnouncer = () => {
  console.log('Adding LiveAnnouncer to the application...');
  
  const layoutPaths = [
    path.join(srcDir, 'app', 'layout.tsx'),
    path.join(srcDir, 'components', 'layout', 'Layout.tsx')
  ];
  
  let announcerAdded = false;
  
  for (const layoutPath of layoutPaths) {
    if (fs.existsSync(layoutPath)) {
      let content = fs.readFileSync(layoutPath, 'utf8');
      
      if (!content.includes('LiveAnnouncer')) {
        // Add import
        content = content.replace(
          /(import.*from.[^;]*;)/,
          `\nimport LiveAnnouncer from '@/components/LiveAnnouncer';`
        );
        
        // Add component
        content = content.replace(
          /(<body[^>]*>)/,
          `\n      <LiveAnnouncer />`
        );
        
        fs.writeFileSync(layoutPath, content);
        console.log(`Added LiveAnnouncer to ${layoutPath}`);
        announcerAdded = true;
        break;
      } else {
        console.log(`LiveAnnouncer already exists in ${layoutPath}`);
        announcerAdded = true;
        break;
      }
    }
  }
  
  if (!announcerAdded) {
    console.warn('Could not find layout file to add LiveAnnouncer. Please add it manually.');
  }
};

// Generate accessibility report
const generateReport = () => {
  console.log('Generating accessibility implementation report...');
  
  const report = `# Vibewell Accessibility Implementation Report
  
## Implemented Improvements

### 1. Keyboard Navigation
- Added visible focus styles for all interactive elements
- Implemented skip link for keyboard users
- Fixed focus management in dialogs

### 2. Screen Reader Support
- Added proper ARIA labels to icons and buttons
- Implemented LiveAnnouncer for dynamic content updates
- Fixed form error message associations

### 3. Color Contrast
- Updated color palette for better contrast ratios
- Fixed text colors for improved readability

### 4. Component Enhancements
- Created accessible dialog component
- Added screen reader text helper component
- Enhanced form error messages with proper ARIA attributes

## Remaining Tasks
- Test with actual screen readers (NVDA, VoiceOver)
- Conduct user testing with keyboard-only users
- Verify mobile touch target sizes

## Accessibility Testing
It is recommended to test the application with:
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE Web Accessibility Tool](https://wave.webaim.org/)
- Manual keyboard navigation testing
- Screen reader testing

## Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
`;
  
  fs.writeFileSync(path.join(accessibilityDir, 'reports', 'implementation-report.md'), report);
  console.log('Report generated at accessibility/reports/implementation-report.md');
};

// Run all implementation steps
const runImplementation = () => {
  copyComponents();
  updateLayout();
  updateGlobalStyles();
  fixColorContrast();
  addLiveAnnouncer();
  generateReport();
  
  console.log('\nAccessibility implementation completed!');
  console.log('Please review the changes and test with screen readers and keyboard navigation.');
};

runImplementation();
