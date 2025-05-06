const fs = require('fs');
const path = require('path');

// Recursively traverse src for test/spec files
function traverse(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (/\.(test|spec)\.(ts|tsx)$/.test(file)) {
      let code = fs.readFileSync(fullPath, 'utf8');
      let updated = code;

      // Strip any leading leftover comments before the first import
      updated = updated.replace(/^[\s\S]*?(?=import)/, '');

      // Fix orphan closing parentheses for arrow callbacks
      updated = updated.replace(/^\s*\)\s*,\s*$/gm, '});');
      updated = updated.replace(/^\s*\)\s*;\s*$/gm, '});');
      // Convert double-close '));' into '});'
      updated = updated.replace(/\)\);/g, '});');

      // Remove standalone commas or semicolons
      updated = updated.replace(/^\s*[;,]\s*$/gm, '');

      if (updated !== code) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Fixed syntax in ${fullPath}`);
      }
    }
  });
}

console.log('Running test syntax fixes...');
const root = path.resolve(__dirname, '../src');
traverse(root);
console.log('Test syntax fixes complete.'); 