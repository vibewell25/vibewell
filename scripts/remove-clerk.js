const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Patterns to replace
const replacements = [
  {
    from: /import\s+.*from\s+['"]@clerk\/nextjs['"]/g,
    to: ''
  },
  {
    from: /import\s+.*from\s+['"]@\/contexts\/clerk-auth-context['"]/g,
    to: "import { useAuth } from '@/lib/auth'"
  }
];

async function* walk(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    const pathToFile = path.join(dir, file);
    const stats = await stat(pathToFile);
    if (stats.isDirectory()) {
      yield* walk(pathToFile);
    } else {
      yield pathToFile;
    }
  }
}

async function processFile(filePath) {
  // Only process TypeScript/JavaScript files
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) return;

  try {
    const content = await readFile(filePath, 'utf8');
    let newContent = content;

    // Apply all replacements
    for (const { from, to } of replacements) {
      newContent = newContent.replace(from, to);
    }

    // Only write if content changed
    if (newContent !== content) {
      console.log(`Updating ${filePath}`);
      await writeFile(filePath, newContent, 'utf8');
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src');
  try {
    for await (const filePath of walk(srcDir)) {
      await processFile(filePath);
    }
    console.log('Finished removing Clerk imports');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 