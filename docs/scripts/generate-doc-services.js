#!/usr/bin/env node
// docs/scripts/generate-doc-services.js
// Generates a markdown file under docs/docs/services for each service category.

const fs = require('fs');
const path = require('path');
const schema = require('../../config/services.schema.json');

// Define services docs root
const servicesDocsDir = path.join(__dirname, '../docs/services');
if (!fs.existsSync(servicesDocsDir)) fs.mkdirSync(servicesDocsDir, { recursive: true });

// Generate index.md
const indexContent = `# Services

Choose a service category to explore guides, API usage, and examples.

${schema.categories
    .map(
      (c) => `- [${c.label} Services](${c.key})`
    )
    .join('\n')}
`;
fs.writeFileSync(path.join(servicesDocsDir, 'index.md'), indexContent, 'utf8');
console.log('Generated services index');

// Generate category pages
schema.categories.forEach((cat) => {
  const content = `---
id: ${cat.key}
title: ${cat.label} Services
sidebar_label: ${cat.label}
---

# ${cat.label} Services

Access all the endpoints and guides for ${cat.label.toLowerCase()} services.

\`\`\`http
GET ${cat.apiPath}
\`\`\`

\`\`\`ts
import { serviceCategories } from '@vibewell/services-types';
\`\`\`

*More documentation coming soon...*
`;
  fs.writeFileSync(path.join(servicesDocsDir, `${cat.key}.md`), content, 'utf8');
  console.log(`Generated ${cat.key}.md`);
}); 