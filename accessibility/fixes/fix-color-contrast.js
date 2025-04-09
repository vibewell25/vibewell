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
  const colorRegex = new RegExp(`['"](${colorName})['"]\s*:\s*['"][^'"]+['"]`, 'g');
  if (colorRegex.test(tailwindConfig)) {
    // Replace existing color
    tailwindConfig = tailwindConfig.replace(
      colorRegex,
      `'${colorName}': '${colorValue}'`
    );
    console.log(`Updated color: ${colorName} to ${colorValue}`);
  } else {
    // Add new color to theme.extend.colors section
    const extendColorsRegex = /(theme\s*:\s*\{\s*extend\s*:\s*\{\s*colors\s*:\s*\{)([^}]*)(})/;
    if (extendColorsRegex.test(tailwindConfig)) {
      tailwindConfig = tailwindConfig.replace(
        extendColorsRegex,
        `  '${colorName}': '${colorValue}',\n      `
      );
      console.log(`Added new color: ${colorName}: ${colorValue}`);
    } else {
      console.log(`Could not find extend.colors section to add ${colorName}`);
    }
  }
});

// Write the updated config back to the file
fs.writeFileSync(tailwindConfigPath, tailwindConfig);
console.log('Tailwind config updated with accessible colors');
