const fs = require('fs');
const path = require('path');

function getAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcDir = path.join(__dirname, '../src');
const files = getAllFiles(srcDir);

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Remove Safe integer operation blocks
  code = code.replace(/\/\/ Safe integer operation[\s\S]*?\n\s*\}\n/gm, '');

  // Remove timeout instrumentation
  code = code.replace(/const start = Date\.now\(\);\s*/g, '');
  code = code.replace(/if\s*\(Date\.now\(\)\s*-\s*start\s*>\s*\d+\)\s*throw new Error\('[^']*'\);\s*/g, '');

  // Remove stray opening braces in async signatures
  code = code.replace(/async\s*\(\s*\{\s*/g, 'async (');

  // Collapse multiple blank lines into one
  code = code.replace(/\n{2,}/g, '\n\n');

  fs.writeFileSync(file, code, 'utf8');
  console.log(`Cleaned instrumentation in ${file}`);
});

console.log('All files cleaned.'); 