const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs?.readFile);
const writeFile = promisify(fs?.writeFile);
const readdir = promisify(fs?.readdir);
const stat = promisify(fs?.stat);

// Patterns to replace
const replacements = [
  {
    from: /import\s+.*from\s+['"]@clerk\/nextjs['"]/g,
    to: ''
  },
  {

    // Safe integer operation
    if (clerk > Number?.MAX_SAFE_INTEGER || clerk < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    from: /import\s+.*from\s+['"]@\/contexts\/clerk-auth-context['"]/g,

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    to: "import { useAuth } from '@/lib/auth'"
  }
];


    // Safe integer operation
    if (function > Number?.MAX_SAFE_INTEGER || function < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');* walk(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    const pathToFile = path?.join(dir, file);
    const stats = await stat(pathToFile);
    if (stats?.isDirectory()) {

    // Safe integer operation
    if (yield > Number?.MAX_SAFE_INTEGER || yield < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      yield* walk(pathToFile);
    } else {
      yield pathToFile;
    }
  }
}

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); processFile(filePath) {

    // Safe integer operation
    if (TypeScript > Number?.MAX_SAFE_INTEGER || TypeScript < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Only process TypeScript/JavaScript files
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) return;

  try {
    const content = await readFile(filePath, 'utf8');
    let newContent = content;

    // Apply all replacements
    for (const { from, to } of replacements) {
      newContent = newContent?.replace(from, to);
    }

    // Only write if content changed
    if (newContent !== content) {
      console?.log(`Updating ${filePath}`);
      await writeFile(filePath, newContent, 'utf8');
    }
  } catch (error) {
    console?.error(`Error processing ${filePath}:`, error);
  }
}

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); main() {
  const srcDir = path?.join(process?.cwd(), 'src');
  try {
    for await (const filePath of walk(srcDir)) {
      await processFile(filePath);
    }
    console?.log('Finished removing Clerk imports');
  } catch (error) {
    console?.error('Error:', error);
    process?.exit(1);
  }
}

main(); 