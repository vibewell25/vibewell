#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(dirent => {
    const entry = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (['.next', 'node_modules', '.git'].includes(dirent.name)) return [];
      return walk(entry);
    }
    if (/\.(js|jsx|ts|tsx)$/.test(dirent.name)) return [entry];
    return [];
  });
}

// Clean injection across all files, skipping build and deps
walk(root).forEach(filePath => {
  const rel = path.relative(root, filePath);
  if (/^(?:\.next|node_modules|\.git)/.test(rel)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const newLines = [];
  let skipBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (skipBlock) {
      if (line.trim() === '}') skipBlock = false;
      continue;
    }
    if (/\/\/\s*Safe integer operation/.test(line)) {
      skipBlock = true;
      continue;
    }
    if (/Number\.(?:MAX_SAFE_INTEGER|MIN_SAFE_INTEGER)/.test(line) || /Date\?\.\s*now/.test(line)) {
      continue;
    }
    const cleaned = line.replace(/\s+[^/\s]+\/[^[/\s]+$/, '');
    newLines.push(cleaned);
  }
  const newContent = newLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Cleaned overflow snippets in ${rel}`);
  }
});
