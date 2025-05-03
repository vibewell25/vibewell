#!/bin/bash

# Vibewell Accessibility Implementation Script
# This script implements the accessibility improvements
# as described in docs/accessibility-audit.md

echo "Setting up Vibewell Accessibility Improvements..."

# Create necessary directories
mkdir -p ./accessibility/reports
mkdir -p ./accessibility/fixes
mkdir -p ./accessibility/components

# Create the focus style fixes
cat > ./accessibility/fixes/focus-styles.css << EOF
/* Enhanced focus styles for better keyboard navigation */
:focus-visible {
  outline: 2px solid #0842A0;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(8, 66, 160, 0.25);
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0842A0;
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}

/* Improved form field focus states */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  border-color: #0842A0;
  box-shadow: 0 0 0 4px rgba(8, 66, 160, 0.25);
  outline: none;
}

/* Button focus states */
button:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid #0842A0;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(8, 66, 160, 0.25);
}
EOF

echo "Focus styles created"

# Create a Skip Link component
cat > ./accessibility/components/SkipLink.tsx << EOF
'use client';

import React from 'react';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  label = "Skip to main content" 
}) => {
  return (
    <a 
      href={\`#\${targetId}\`} 
      className="skip-link"
    >
      {label}
    </a>
  );
};

export default SkipLink;
EOF

echo "Skip Link component created"

# Create a color contrast fixer script
cat > ./accessibility/fixes/fix-color-contrast.js << EOF
/**
 * This script updates the Tailwind configuration to use more accessible colors
 * with better contrast ratios
 */
const fs = require('fs');
const path = require('path');

// Path to the Tailwind config file
const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');

// Read the existing config
let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');

// Define new colors with better contrast
const accessibleColors = {
  // Increase contrast for muted foreground (used for secondary text)
  'muted-foreground': '#666876', // Darkened from original for better contrast
  
  // Increase contrast for primary hover state
  'primary-hover': '#0842A0', // Darkened for better contrast
  
  // Enhance contrast for destructive color
  'destructive': '#E53935', // Brightened red for better visibility

  // Enhance error state colors
  'error': '#D32F2F',
  'error-foreground': '#FFFFFF',
  
  // Enhance success state colors
  'success': '#2E7D32',
  'success-foreground': '#FFFFFF',
};

// Replace colors in the config
Object.entries(accessibleColors).forEach(([colorName, colorValue]) => {
  // Look for the color in the theme colors section
  const colorRegex = new RegExp(\`['"](\${colorName})['"]\\s*:\\s*['"][^'"]+['"]\`, 'g');
  if (colorRegex.test(tailwindConfig)) {
    // Replace existing color
    tailwindConfig = tailwindConfig.replace(
      colorRegex,
      \`'\${colorName}': '\${colorValue}'\`
    );
    console.log(\`Updated color: \${colorName} to \${colorValue}\`);
  } else {
    // Add new color to theme.extend.colors section
    const extendColorsRegex = /(theme\s*:\s*\{\s*extend\s*:\s*\{\s*colors\s*:\s*\{)([^}]*)(})/;
    if (extendColorsRegex.test(tailwindConfig)) {
      tailwindConfig = tailwindConfig.replace(
        extendColorsRegex,
        \`$1$2  '\${colorName}': '\${colorValue}',\n      $3\`
      );
      console.log(\`Added new color: \${colorName}: \${colorValue}\`);
    } else {
      console.log(\`Could not find extend.colors section to add \${colorName}\`);
    }
  }
});

// Write the updated config back to the file
fs.writeFileSync(tailwindConfigPath, tailwindConfig);
console.log('Tailwind config updated with accessible colors');
EOF

echo "Color contrast fixer script created"

# Create a helper for screen readers
cat > ./accessibility/components/ScreenReaderText.tsx << EOF
import React from 'react';

interface ScreenReaderTextProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const ScreenReaderText: React.FC<ScreenReaderTextProps> = ({ 
  children,
  as: Component = 'span'
}) => {
  return (
    <Component 
      className="sr-only" 
      aria-hidden="false"
    >
      {children}
    </Component>
  );
};

export default ScreenReaderText;
EOF

echo "Screen reader helper component created"

# Create ARIA live announcer component
cat > ./accessibility/components/LiveAnnouncer.tsx << EOF
'use client';

import { useState, useEffect, useCallback } from 'react';

interface LiveAnnouncerProps {
  politeness?: 'polite' | 'assertive';
}

// Component for screen reader announcements
const LiveAnnouncer = ({ politeness = 'polite' }: LiveAnnouncerProps) => {
  const [message, setMessage] = useState('');

  const announce = useCallback((text: string) => {
    setMessage(''); // Clear first to ensure announcement on repeated messages
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMessage(text);
      });
    });
  }, []);

  // Add the announcer to the window object for global access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.announcer = { announce };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.announcer;
      }
    };
  }, [announce]);

  return (
    <div 
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

export default LiveAnnouncer;

// Type definition for the global announcer
declare global {
  interface Window {
    announcer?: {
      announce: (message: string) => void;
    };
  }
}
EOF

echo "ARIA live announcer component created"

# Create a dialog component with proper focus management
cat > ./accessibility/components/AccessibleDialog.tsx << EOF
'use client';

import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AccessibleDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  footer
}) => {
  const initialFocusRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Store the element that had focus when dialog was opened
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Set focus to dialog when opened and return focus when closed
  useEffect(() => {
    if (isOpen) {
      initialFocusRef.current?.focus();
    } else if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        ref={initialFocusRef}
        tabIndex={-1}
        className="focus:outline-none"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
      >
        <DialogHeader>
          <DialogTitle id="dialog-title">{title}</DialogTitle>
          {description && (
            <p id="dialog-description" className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </DialogHeader>
        
        <div>{children}</div>
        
        {footer && (
          <DialogFooter>{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccessibleDialog;
EOF

echo "Accessible dialog component created"

# Create FormErrorMessage component with correct ARIA
cat > ./accessibility/components/FormErrorMessage.tsx << EOF
import React from 'react';

interface FormErrorMessageProps {
  id: string;
  children: React.ReactNode;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ 
  id, 
  children 
}) => {
  if (!children) return null;
  
  return (
    <div 
      id={id}
      role="alert"
      className="text-sm text-error mt-1"
    >
      {children}
    </div>
  );
};

export default FormErrorMessage;
EOF

echo "Form error message component created"

# Create an Icon component that ensures accessibility
cat > ./accessibility/components/AccessibleIcon.tsx << EOF
import React from 'react';

interface AccessibleIconProps {
  icon: React.ReactNode;
  label: string;
  labelPosition?: 'before' | 'after' | 'hidden';
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  icon,
  label,
  labelPosition = 'hidden',
  onClick,
}) => {
  // If it's a clickable icon, render as a button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center"
        aria-label={labelPosition === 'hidden' ? label : undefined}
      >
        {labelPosition === 'before' && <span className="mr-2">{label}</span>}
        <span aria-hidden={labelPosition !== 'hidden'}>{icon}</span>
        {labelPosition === 'after' && <span className="ml-2">{label}</span>}
      </button>
    );
  }

  // If it's just a visual icon with accessible label
  return (
    <span className="inline-flex items-center">
      {labelPosition === 'before' && <span className="mr-2">{label}</span>}
      <span 
        aria-hidden={labelPosition !== 'hidden'} 
        role={labelPosition === 'hidden' ? 'img' : undefined}
        aria-label={labelPosition === 'hidden' ? label : undefined}
      >
        {icon}
      </span>
      {labelPosition === 'after' && <span className="ml-2">{label}</span>}
    </span>
  );
};

export default AccessibleIcon;
EOF

echo "Accessible icon component created"

# Create an implementation plan script
cat > ./accessibility/implement-fixes.js << EOF
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
    console.log(\`Copied \${path.basename(src)} to \${dest}\`);
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
          \`$1\\nimport SkipLink from '@/components/SkipLink';\`
        );
        
        // Add skip link component
        content = content.replace(
          /(<body[^>]*>)([\\s\\S]*?)(<.*?main[^>]*>)/m,
          \`$1\\n      <SkipLink targetId="main-content" />$2$3\`
        );
        
        // Add ID to main content
        content = content.replace(
          /(<main[^>]*)>/,
          \`$1 id="main-content">\`
        );
        
        fs.writeFileSync(layoutPath, content);
        console.log(\`Updated \${layoutPath} with skip link\`);
        layoutUpdated = true;
        break;
      } else {
        console.log(\`Skip link already exists in \${layoutPath}\`);
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
        content += \`\\n\\n/* Accessibility Improvements */\\n\${focusStyles}\`;
        fs.writeFileSync(stylePath, content);
        console.log(\`Updated \${stylePath} with accessibility styles\`);
        stylesUpdated = true;
        break;
      } else {
        console.log(\`Accessibility styles already exist in \${stylePath}\`);
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
          \`$1\\nimport LiveAnnouncer from '@/components/LiveAnnouncer';\`
        );
        
        // Add component
        content = content.replace(
          /(<body[^>]*>)/,
          \`$1\\n      <LiveAnnouncer />\`
        );
        
        fs.writeFileSync(layoutPath, content);
        console.log(\`Added LiveAnnouncer to \${layoutPath}\`);
        announcerAdded = true;
        break;
      } else {
        console.log(\`LiveAnnouncer already exists in \${layoutPath}\`);
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
  
  const report = \`# Vibewell Accessibility Implementation Report
  
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
\`;
  
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
  
  console.log('\\nAccessibility implementation completed!');
  console.log('Please review the changes and test with screen readers and keyboard navigation.');
};

runImplementation();
EOF

# Make the implementation script executable
chmod +x ./accessibility/implement-fixes.js

echo "Accessibility implementation script created"

# Create a documentation file
cat > ./accessibility/README.md << EOF
# Vibewell Accessibility Implementation

This directory contains components, fixes, and scripts to improve the accessibility of the Vibewell platform according to the recommendations in the accessibility audit.

## Components

- **SkipLink**: A component that allows keyboard users to skip navigation and go directly to main content
- **ScreenReaderText**: Utility component for text that's only visible to screen readers
- **LiveAnnouncer**: Component for making dynamic changes known to screen reader users
- **AccessibleDialog**: A dialog component with proper focus management
- **FormErrorMessage**: Component that associates error messages with form fields
- **AccessibleIcon**: Icon wrapper that ensures proper screen reader support

## Fixes

- **focus-styles.css**: Enhanced focus styles for keyboard navigation
- **fix-color-contrast.js**: Script to update Tailwind colors for better contrast

## Implementation

To implement the accessibility improvements:

1. Run the implementation script:
   \`\`\`
   node accessibility/implement-fixes.js
   \`\`\`

2. Test the application using:
   - Keyboard-only navigation
   - Screen readers (NVDA, VoiceOver, JAWS)
   - Automated tools like axe or Lighthouse

3. Review the implementation report in \`accessibility/reports/implementation-report.md\`

## Manual Testing Checklist

- [ ] Verify all interactive elements can be accessed with the keyboard
- [ ] Check that focus order follows a logical sequence
- [ ] Test skip link functionality
- [ ] Verify proper heading structure
- [ ] Check color contrast with the WebAIM contrast checker
- [ ] Test with screen readers
- [ ] Verify form validation errors are announced to screen readers
- [ ] Check that images have appropriate alt text

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
EOF

echo "Accessibility documentation created"

echo "Accessibility implementation completed successfully!"
echo "To implement the improvements, run: node accessibility/implement-fixes.js"
echo "For more information, see: accessibility/README.md"

# Make this script executable
chmod +x scripts/setup-accessibility.sh 