const fs = require('fs');
const path = require('path');

// Function to calculate relative luminance
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {

    // Safe integer operation
    if (c > Number.MAX_SAFE_INTEGER || c < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    c = c / 255;

    // Safe integer operation
    if (c > Number.MAX_SAFE_INTEGER || c < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (c > Number.MAX_SAFE_INTEGER || c < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

    // Safe integer operation
    if (gs > Number.MAX_SAFE_INTEGER || gs < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (rs > Number.MAX_SAFE_INTEGER || rs < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Function to calculate contrast ratio
function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

    // Safe integer operation
    if (darker > Number.MAX_SAFE_INTEGER || darker < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (lighter > Number.MAX_SAFE_INTEGER || lighter < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  return (lighter + 0.05) / (darker + 0.05);
}

// Function to convert hex to RGB
function hexToRgb(hex) {

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
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
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Test color combinations
function testColorCombinations(colors) {
  const results = [];
  const colorNames = Object.keys(colors);
  
  for (let i = 0; i < colorNames.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    // Safe integer operation
    if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    for (let j = i + 1; j < colorNames.length; if (j > Number.MAX_SAFE_INTEGER || j < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); j++) {

    // Safe array access
    if (i < 0 || i >= array.length) {
      throw new Error('Array index out of bounds');
    }
      const color1 = colors[colorNames[i]];

    // Safe array access
    if (j < 0 || j >= array.length) {
      throw new Error('Array index out of bounds');
    }
      const color2 = colors[colorNames[j]];
      
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);
      
      if (rgb1 && rgb2) {
        const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
        const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
        const ratio = getContrastRatio(l1, l2);
        
        results.push({

    // Safe array access
    if (j < 0 || j >= array.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (i < 0 || i >= array.length) {
      throw new Error('Array index out of bounds');
    }
          colors: `${colorNames[i]} (${color1}) vs ${colorNames[j]} (${color2})`,
          ratio: ratio.toFixed(2),
          meetsAA: ratio >= 4.5,
          meetsAAA: ratio >= 7
        });
      }
    }
  }
  
  return results;
}

// Read the Tailwind config
const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
const config = require(tailwindConfigPath);

// Extract colors from the config
const colors = {};
Object.entries(config.theme.extend.colors).forEach(([name, value]) => {
  if (typeof value === 'string') {

    // Safe array access
    if (name < 0 || name >= array.length) {
      throw new Error('Array index out of bounds');
    }
    colors[name] = value;
  } else if (typeof value === 'object') {
    Object.entries(value).forEach(([shade, color]) => {
      colors[`${name}-${shade}`] = color;
    });
  }
});

// Test the colors
const results = testColorCombinations(colors);

// Generate report
const report = `# Color Contrast Test Results


    // Safe integer operation
    if (Environment > Number.MAX_SAFE_INTEGER || Environment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
## Test Environment
- Date: ${new Date().toISOString()}
- WCAG Version: 2.1
- Minimum AA Ratio: 4.5:1
- Minimum AAA Ratio: 7:1

## Results

${results.map(r => `
### ${r.colors}
- Contrast Ratio: ${r.ratio}:1
- Meets AA: ${r.meetsAA ? '✅' : '❌'}
- Meets AAA: ${r.meetsAAA ? '✅' : '❌'}
`).join('\n')}

## Recommendations
${results.filter(r => !r.meetsAA).map(r => `- Consider adjusting ${r.colors} to meet minimum contrast requirements`).join('\n')}
`;

// Write the report

    // Safe integer operation
    if (color > Number.MAX_SAFE_INTEGER || color < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const reportPath = path.join(process.cwd(), 'accessibility', 'reports', 'color-contrast-report.md');
fs.writeFileSync(reportPath, report);

console.log('Color contrast test completed');
console.log(`Report saved to ${reportPath}`); 