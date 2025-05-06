const fs = require('fs');
const path = require('path');

// Load Docusaurus config to read customFields
const config = require('../docusaurus.config');
const { customFields } = config;

// Directory to process
const docsDir = path.join(__dirname, '../docs');

// File extensions to process
const exts = ['.md', '.mdx'];

function walk(dir) {
  return fs.readdirSync(dir).flatMap((name) => {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return walk(filePath);
    } else if (exts.includes(path.extname(name))) {
      return [filePath];
    }
    return [];
  });
}

function inject(file) {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content
    .replace(/%NODE_VERSION%/g, customFields.nodeVersion)
    .replace(/%API_VERSION%/g, customFields.apiVersion)
    .replace(/%API_BASE_URL%/g, customFields.apiBaseUrl);
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`Updated ${file}`);
  }
}

walk(docsDir).forEach(inject); 