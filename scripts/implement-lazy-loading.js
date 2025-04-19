#!/usr/bin/env node

/**
 * Script to implement lazy loading for heavy components
 * like AR viewer, resource detail, and event calendar
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of components to be lazy loaded
const componentsToLazyLoad = [
  {
    name: 'AR Viewer',
    source: 'src/components/ar/ARViewer.tsx',
    isHeavy: true,
    dependencies: ['@react-three/fiber', '@react-three/drei', 'three']
  },
  {
    name: 'Resource Detail',
    source: 'src/components/ResourceDetail.tsx',
    isHeavy: true,
    dependencies: []
  },
  {
    name: 'Event Calendar',
    source: 'src/components/event-calendar/EventCalendar.tsx',
    isHeavy: true,
    dependencies: ['date-fns']
  },
  {
    name: 'Virtual Try On',
    source: 'src/components/try-on/VirtualTryOn.tsx',
    isHeavy: true,
    dependencies: ['@react-three/fiber', '@tensorflow/tfjs']
  }
];

// Create dynamic import wrappers
const createLazyLoadedComponent = (componentInfo) => {
  console.log(`Processing: ${componentInfo.name} (${componentInfo.source})`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(componentInfo.source)) {
      console.log(`  Skipping: File not found ${componentInfo.source}`);
      return false;
    }
    
    // Read the original file content
    const content = fs.readFileSync(componentInfo.source, 'utf8');
    
    // Get component directory and filename
    const dir = path.dirname(componentInfo.source);
    const fileName = path.basename(componentInfo.source);
    const componentName = fileName.replace(/\.(tsx|jsx)$/, '');
    
    // Create wrapper file name
    const wrapperFileName = `${componentName}Lazy.tsx`;
    const wrapperPath = path.join(dir, wrapperFileName);
    
    // Create the lazy loading wrapper content
    const wrapperContent = `import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy component
const ${componentName} = lazy(() => import('./${fileName.replace(/\.(tsx|jsx)$/, '')}'));

// Props type should match the underlying component
type ${componentName}Props = React.ComponentProps<typeof ${componentName}>;

/**
 * Lazy-loaded version of ${componentName}
 * This component will only be loaded when it's needed, reducing initial bundle size
 */
export function ${componentName}Lazy(props: ${componentName}Props) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <${componentName} {...props} />
    </Suspense>
  );
}

// Loading fallback UI
function LoadingFallback() {
  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-8 w-1/2 rounded-md" />
      </div>
    </div>
  );
}
`;
    
    // Write the wrapper file
    fs.writeFileSync(wrapperPath, wrapperContent, 'utf8');
    console.log(`  Created: ${wrapperPath}`);
    return true;
    
  } catch (error) {
    console.error(`  Error processing ${componentInfo.name}:`, error);
    return false;
  }
};

// Main function
const main = () => {
  console.log('Starting lazy loading implementation...');
  
  let successCount = 0;
  let failCount = 0;
  
  // Create lazy loaded component wrappers
  componentsToLazyLoad.forEach(componentInfo => {
    const success = createLazyLoadedComponent(componentInfo);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  });
  
  console.log('\nLazy loading implementation complete!');
  console.log(`Created: ${successCount} lazy loading wrappers`);
  
  if (failCount > 0) {
    console.log(`Failed: ${failCount} components`);
  }
  
  // Instructions for manual integration
  console.log('\nNext steps to complete implementation:');
  console.log('1. Import the lazy versions of components where they are used');
  console.log('   Example: import { ARViewerLazy } from "@/components/ar/ARViewerLazy"');
  console.log('2. Replace component usage with lazy version');
  console.log('   Example: <ARViewer /> → <ARViewerLazy />');
  console.log('3. Add to other heavy components as needed');
};

// Run the script
main(); 