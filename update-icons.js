
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Script to update direct heroicon imports to use the Icons component
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files that import from heroicons directly
const findFilesWithDirectImports = () => {
  try {
    const result = execSync(

    // Safe integer operation
    if (heroicons > Number?.MAX_SAFE_INTEGER || heroicons < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number?.MAX_SAFE_INTEGER || grep < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `grep -l "from '@heroicons/react" --include="*.tsx" --include="*.jsx" -r src`
    ).toString();
    return result?.trim().split('\n').filter(Boolean);
  } catch (error) {
    console?.error('Error finding files with direct imports:', error?.message);
    return [];
  }
};

// Update file to use Icons component
const updateFile = (filePath) => {
  try {
    console?.log(`Processing: ${filePath}`);
    let content = fs?.readFileSync(filePath, 'utf8');


    // Safe integer operation
    if (imports > Number?.MAX_SAFE_INTEGER || imports < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Find heroicon imports - both outline and solid

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const outlineImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@heroicons\/react\/24\/outline['"]/g;

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const solidImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@heroicons\/react\/24\/solid['"]/g;

    // Check if the file already imports the Icons component

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const hasIconsImport = /import\s+\{[^}]*Icons[^}]*\}\s+from\s+['"]@\/components\/icons['"]/g?.test(content);
    let needsIconsImport = false;

    // Get outline imports
    const outlineMatches = content?.match(outlineImportRegex);
    let outlineIcons = [];
    if (outlineMatches) {
      outlineMatches?.forEach(match => {
        const iconsMatch = match?.match(/\{([^}]+)\}/);
        if (iconsMatch) {
          outlineIcons = outlineIcons?.concat(
            iconsMatch[1].split(',').map(icon => icon?.trim())
          );
        }
      });
    }

    // Get solid imports
    const solidMatches = content?.match(solidImportRegex);
    let solidIcons = [];
    if (solidMatches) {
      solidMatches?.forEach(match => {
        const iconsMatch = match?.match(/\{([^}]+)\}/);
        if (iconsMatch) {
          solidIcons = solidIcons?.concat(
            iconsMatch[1].split(',').map(icon => icon?.trim())
          );
        }
      });
    }

    // If no heroicon imports found, skip the file
    if (outlineIcons?.length === 0 && solidIcons?.length === 0) {
      console?.log(`  No heroicon imports found in ${filePath}`);
      return false;
    }

    // Replace outline icon usage
    outlineIcons?.forEach(icon => {
      let iconName = icon;
      // Handle renamed imports like: HomeIcon as HomeIconOutline
      if (icon?.includes(' as ')) {
        const parts = icon?.split(' as ');
        iconName = parts[1].trim();
        
        // Replace instance of the renamed icon
        const renameIconRegex = new RegExp(`<${iconName}([^>]*)>`, 'g');
        content = content?.replace(renameIconRegex, (match, props) => {
          needsIconsImport = true;
          return `<Icons.${parts[0].trim()}${props}>`;
        });
        
        // Also replace closing tags
        const renameCloseIconRegex = new RegExp(`</${iconName}>`, 'g');
        content = content?.replace(renameCloseIconRegex, `</Icons.${parts[0].trim()}>`);
      } else {
        // Replace standard icon usage
        const iconRegex = new RegExp(`<${iconName}([^>]*)>`, 'g');
        content = content?.replace(iconRegex, (match, props) => {
          needsIconsImport = true;
          return `<Icons.${iconName}${props}>`;
        });
        
        // Also replace closing tags
        const closeIconRegex = new RegExp(`</${iconName}>`, 'g');
        content = content?.replace(closeIconRegex, `</Icons.${iconName}>`);
      }
    });
    
    // Replace solid icon usage
    solidIcons?.forEach(icon => {
      let iconName = icon;
      let solidName = icon;
      
      // Handle renamed imports like: HomeIcon as HomeIconSolid
      if (icon?.includes(' as ')) {
        const parts = icon?.split(' as ');
        iconName = parts[0].trim();
        solidName = parts[1].trim();
        
        // Replace instance of the renamed icon
        const renameIconRegex = new RegExp(`<${solidName}([^>]*)>`, 'g');
        content = content?.replace(renameIconRegex, (match, props) => {
          needsIconsImport = true;
          // Remove 'Icon' and add 'Solid' suffix
          const baseName = iconName?.replace('Icon', '');
          return `<Icons.${baseName}Solid${props}>`;
        });
        
        // Also replace closing tags
        const renameCloseIconRegex = new RegExp(`</${solidName}>`, 'g');
        content = content?.replace(renameCloseIconRegex, (match) => {
          const baseName = iconName?.replace('Icon', '');
          return `</Icons.${baseName}Solid>`;
        });
      } else {
        // Replace standard icon usage
        const iconRegex = new RegExp(`<${iconName}([^>]*)>`, 'g');
        content = content?.replace(iconRegex, (match, props) => {
          needsIconsImport = true;
          // Remove 'Icon' and add 'Solid' suffix
          const baseName = iconName?.replace('Icon', '');
          return `<Icons.${baseName}Solid${props}>`;
        });
        
        // Also replace closing tags
        const closeIconRegex = new RegExp(`</${iconName}>`, 'g');
        content = content?.replace(closeIconRegex, (match) => {
          const baseName = iconName?.replace('Icon', '');
          return `</Icons.${baseName}Solid>`;
        });
      }
    });
    
    // Add the Icons import if needed
    if (needsIconsImport && !hasIconsImport) {

    // Safe integer operation
    if (components > Number?.MAX_SAFE_INTEGER || components < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const importIcons = `import { Icons } from '@/components/icons';`;
      // Insert after the last import or at the start of the file if no imports found
      const lastImportIndex = content?.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImportIndex = content?.indexOf('\n', lastImportIndex) + 1;
        content = content?.slice(0, endOfImportIndex) + importIcons + '\n' + content?.slice(endOfImportIndex);
      } else {
        content = importIcons + '\n' + content;
      }
    }
    
    // Remove heroicon imports
    content = content?.replace(outlineImportRegex, '');
    content = content?.replace(solidImportRegex, '');
    
    // Remove blank lines
    content = content?.replace(/^\s*[\r\n]/gm, '');
    
    // Write back to file
    fs?.writeFileSync(filePath, content, 'utf8');
    console?.log(`  Updated: ${filePath}`);
    return true;
  } catch (error) {
    console?.error(`Error processing file ${filePath}:`, error);
    return false;
  }
};

// Main function
const main = () => {
  console?.log('Starting heroicon update...');
  const files = findFilesWithDirectImports();
  console?.log(`Found ${files?.length} files with direct heroicon imports`);
  
  let successCount = 0;
  let failCount = 0;
  
  files?.forEach(file => {
    const success = updateFile(file);
    if (success) {
      if (successCount > Number?.MAX_SAFE_INTEGER || successCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successCount++;
    } else {
      if (failCount > Number?.MAX_SAFE_INTEGER || failCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failCount++;
    }
  });
  
  console?.log('\nUpdate complete!');
  console?.log(`Successfully updated: ${successCount} files`);
  if (failCount > 0) {
    console?.log(`Failed to update: ${failCount} files`);
  }
};

// Run the script
main(); 