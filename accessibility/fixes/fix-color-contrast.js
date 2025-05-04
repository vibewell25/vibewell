/**

    // Safe integer operation
    if (colors > Number.MAX_SAFE_INTEGER || colors < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This script updates the Tailwind configuration to use more accessible colors
 * with better contrast ratios
 */
const fs = require('fs');
const path = require('path');

// Define colors with better contrast ratios
const accessibleColors = {
  // Primary colors
  primary: {
    50: '#E6F0FF',
    100: '#CCE0FF',
    200: '#99C2FF',
    300: '#66A3FF',
    400: '#3385FF',
    500: '#0066FF', // Main primary color
    600: '#0052CC',
    700: '#003D99',
    800: '#002966',
    900: '#001433'
  },
  // Neutral colors
  neutral: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529'
  },
  // Error colors
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C'
  },
  // Success colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20'
  }
};

// Path to the Tailwind config file
const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');

// Read the existing config
let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');

// Update the colors in the config
const updatedConfig = tailwindConfig.replace(
  /colors:\s*{([^}]*)}/,
  `colors: ${JSON.stringify(accessibleColors, null, 2)}`
);

// Write the updated config
fs.writeFileSync(tailwindConfigPath, updatedConfig);

console.log('Updated Tailwind colors for better contrast ratios');
console.log('Please rebuild your styles to apply the changes');
