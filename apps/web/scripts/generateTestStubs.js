#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
// Only generate stubs for UI component and app files
const INCLUDE_DIRS = ['components', 'app'];

function toTestPath(filePath) {
  const rel = path.relative(SRC_DIR, filePath);
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  return path.resolve(SRC_DIR, dir, '__tests__', `${base}.test${path.extname(rel)}`);
}

function createTestStub(componentPath) {
  const testPath = toTestPath(componentPath);
  if (fs.existsSync(testPath)) return;
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const importPath = path.relative(path.dirname(testPath), componentPath).replace(/\.tsx?$/, '');
  const content = `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${componentName} from '${importPath}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    const { container } = render(<${componentName} />);
    expect(container).toBeInTheDocument();
  });
});
`;
  fs.mkdirSync(path.dirname(testPath), { recursive: true });
  fs.writeFileSync(testPath, content, 'utf8');
  console.log(`Generated test stub: ${path.relative(process.cwd(), testPath)}`);
}

function traverse(dir) {
  fs.readdirSync(dir).forEach((name) => {
    if (name === '__tests__') return; // skip test folders
    const full = path.join(dir, name);
    const rel = path.relative(SRC_DIR, full);
    const parts = rel.split(path.sep);
    if (!INCLUDE_DIRS.includes(parts[0])) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      traverse(full);
    } else if (
      /\.tsx$/.test(name) &&
      /^[A-Z]/.test(name) &&
      !name.includes('-') &&
      !name.endsWith('.d.ts') &&
      !name.endsWith('.test.tsx') &&
      !name.startsWith('index')
    ) {
      createTestStub(full);
    }
  });
}

console.log('Cleaning old __tests__ directories...');
traverse(SRC_DIR);
console.log('Test stub generation complete.'); 