#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(dirent => {
    const entry = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (['.next', 'node_modules', '.git', 'docs'].includes(dirent.name)) return [];
      return walk(entry);
    }
    if (dirent.name.toLowerCase() === 'readme.md') return [entry];
    return [];
  });
}

const readmes = walk(root).filter(p => p !== path.join(root, 'README.md'));
if (readmes.length === 0) {
  console.log('No local README.md files found.');
  process.exit(0);
}
readmes.forEach(filePath => {
  const rel = path.relative(root, filePath);
  const base = rel.replace(/\/README\.md$/i, '').split(path.sep).join('-');
  const dest = path.join(root, 'docs', `${base}.md`);
  fs.renameSync(filePath, dest);
  console.log(`Moved ${rel} → docs/${base}.md`);
});
console.log('README collation complete.');
