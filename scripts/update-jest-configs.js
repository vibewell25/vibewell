#!/usr/bin/env node

/**
 * This script updates Jest configuration files to ensure they use the enhanced setup
 * and properly mock problematic dependencies
 */

const fs = require('fs');
const path = require('path');

// Paths to Jest configuration files
const configFiles = [
  'jest.config.js',
  'jest.enhanced.config.js',
  'jest.e2e.config.js',
  'jest.smoke.config.js',
  'jest.post-deploy.config.js'
];

// Updates to ensure are in each config file
const ensureModuleNameMapperEntries = {
  // Handle Three.js imports
  'three/examples/jsm/loaders/GLTFLoader': '<rootDir>/__mocks__/GLTFLoader.js',
  'three/examples/jsm/loaders/DRACOLoader': '<rootDir>/__mocks__/DRACOLoader.js',
  'three': '<rootDir>/__mocks__/three.js',
  
  // Handle CSS and asset imports
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
};

// Ensure transformIgnorePatterns has correct entries
const ensureTransformIgnorePatterns = [
  '/node_modules/(?!(three|@react-three|@testing-library/user-event|msw))',
  '^.+\\.module\\.(css|sass|scss)$',
];

// Process each config file
configFiles.forEach(configFile => {
  const filePath = path.join(process.cwd(), configFile);
  
  // Skip if file doesn't exist
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${configFile} - file not found`);
    return;
  }
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace setupFilesAfterEnv to use enhanced setup
  content = content.replace(
    /setupFilesAfterEnv:\s*\[\s*['"](.*?)['"]\s*\]/,
    `setupFilesAfterEnv: ['<rootDir>/jest.enhanced-setup.js']`
  );
  
  // Ensure moduleNameMapper includes our entries
  if (content.includes('moduleNameMapper')) {
    // Get the current moduleNameMapper object
    const moduleNameMapperMatch = content.match(/moduleNameMapper:\s*{([^}]*)}/s);
    
    if (moduleNameMapperMatch) {
      let mapperContent = moduleNameMapperMatch[1];
      
      // Add our entries if they don't exist
      Object.entries(ensureModuleNameMapperEntries).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`['"]${escapedKey}['"]:\\s*['"].*?['"]`);
        
        if (!pattern.test(mapperContent)) {
          mapperContent += `\n    '${key}': '${value}',`;
        }
      });
      
      // Update the content with new moduleNameMapper
      content = content.replace(
        /moduleNameMapper:\s*{([^}]*)}/s,
        `moduleNameMapper: {${mapperContent}}`
      );
    }
  }
  
  // Ensure transformIgnorePatterns includes our entries
  if (content.includes('transformIgnorePatterns')) {
    // Get the current transformIgnorePatterns array
    const transformPatternsMatch = content.match(/transformIgnorePatterns:\s*\[(.*?)\]/s);
    
    if (transformPatternsMatch) {
      let patternsContent = transformPatternsMatch[1];
      
      // Add our entries if they don't exist
      ensureTransformIgnorePatterns.forEach(pattern => {
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`['"]${escapedPattern}['"]`);
        
        if (!regex.test(patternsContent)) {
          patternsContent += `\n    '${pattern}',`;
        }
      });
      
      // Update the content with new transformIgnorePatterns
      content = content.replace(
        /transformIgnorePatterns:\s*\[(.*?)\]/s,
        `transformIgnorePatterns: [${patternsContent}]`
      );
    }
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${configFile}`);
});

console.log('All Jest configuration files have been updated'); 