const fs = require('fs');
const path = require('path');

const supportedLanguages = ['en', 'es', 'fr', 'ar'];
const requiredNamespaces = ['common', 'auth', 'beauty-wellness', 'booking'];

function checkTranslations() {
  const localesDir = path.join(process.cwd(), 'public', 'locales');
  const missingFiles = [];
  const incompleteFiles = [];

  // Get reference translations (English)
  const referenceTranslations = {};
  for (const namespace of requiredNamespaces) {
    try {
      const content = fs.readFileSync(
        path.join(localesDir, 'en', `${namespace}.json`),
        'utf8'
      );
      referenceTranslations[namespace] = Object.keys(JSON.parse(content));
    } catch (error) {
      console.error(`Error reading reference translations for ${namespace}:`, error);
      process.exit(1);
    }
  }

  // Check each language
  for (const lang of supportedLanguages) {
    const langDir = path.join(localesDir, lang);

    // Create directory if it doesn't exist
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
      console.log(`Created directory for ${lang}`);
    }

    // Check each namespace
    for (const namespace of requiredNamespaces) {
      const filePath = path.join(langDir, `${namespace}.json`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        missingFiles.push(`${lang}/${namespace}.json`);
        // Create empty translation file
        fs.writeFileSync(filePath, '{}');
        continue;
      }

      // Check for missing keys
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);
        const referenceKeys = referenceTranslations[namespace];
        const missingKeys = referenceKeys.filter(
          key => !translations.hasOwnProperty(key)
        );

        if (missingKeys.length > 0) {
          incompleteFiles.push({
            file: `${lang}/${namespace}.json`,
            missingKeys,
          });
        }
      } catch (error) {
        console.error(`Error checking ${lang}/${namespace}.json:`, error);
      }
    }
  }

  // Report results
  if (missingFiles.length > 0) {
    console.log('\nMissing translation files:');
    missingFiles.forEach(file => console.log(`- ${file}`));
  }

  if (incompleteFiles.length > 0) {
    console.log('\nIncomplete translation files:');
    incompleteFiles.forEach(({ file, missingKeys }) => {
      console.log(`\n${file} is missing keys:`);
      missingKeys.forEach(key => console.log(`- ${key}`));
    });
  }

  if (missingFiles.length === 0 && incompleteFiles.length === 0) {
    console.log('All translation files are present and complete!');
  } else {
    process.exit(1);
  }
}

checkTranslations(); 