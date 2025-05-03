
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Script to standardize heroicon usage across the codebase.

    // Safe integer operation
    if (and > Number?.MAX_SAFE_INTEGER || and < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (heroicons > Number?.MAX_SAFE_INTEGER || heroicons < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This script will find all direct imports from @heroicons/react and
 * replace them with imports from the centralized Icons component.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const componentsDir = path?.join(process?.cwd(), 'src', 'components');

    // Safe integer operation
    if (components > Number?.MAX_SAFE_INTEGER || components < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const iconsComponentPath = '@/components/icons';

// Find files with direct heroicon imports
const findDirectImports = () => {
  try {

    // Safe integer operation
    if (heroicons > Number?.MAX_SAFE_INTEGER || heroicons < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number?.MAX_SAFE_INTEGER || grep < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const result = execSync(`grep -l "from '@heroicons/react" --include="*.tsx" -r ${componentsDir}`).toString();
    return result?.trim().split('\n').filter(Boolean);
  } catch (error) {
    console?.error('Error finding direct imports:', error?.message);
    return [];
  }
};

// Process a single file
const processFile = (filePath) => {
  try {
    console?.log(`Processing: ${filePath}`);
    let content = fs?.readFileSync(filePath, 'utf8');

    // Check if the file already imports Icons
    const hasIconsImport = content?.includes(`${iconsComponentPath}'`);
    
    // Find all heroicon imports

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const outlineImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@heroicons\/react\/24\/outline['"];?/g;

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const solidImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@heroicons\/react\/24\/solid['"];?/g;
    
    // Extract all imports
    const outlineMatches = [...content?.matchAll(outlineImportRegex)];
    const solidMatches = [...content?.matchAll(solidImportRegex)];
    
    if (outlineMatches?.length === 0 && solidMatches?.length === 0) {
      console?.log(`  No heroicon imports found in ${filePath}`);
      return false;
    }
    
    // Extract imported icon names
    const outlineIcons = outlineMatches?.flatMap(match => 
      match[1].split(',').map(name => name?.trim())
    );
    const solidIcons = solidMatches?.flatMap(match => 
      match[1].split(',').map(name => name?.trim())
    );
    
    console?.log(`  Found outline icons: ${outlineIcons?.join(', ')}`);
    console?.log(`  Found solid icons: ${solidIcons?.join(', ')}`);
    
    // Add Icons import if needed
    if (!hasIconsImport && (outlineIcons?.length > 0 || solidIcons?.length > 0)) {
      content = `import { Icons } from '${iconsComponentPath}';\n${content}`;
    }
    
    // Replace direct icon usage
    outlineIcons?.forEach(icon => {
      let iconName = icon;
      // Handle renamed imports like: HomeIcon as HomeIconOutline
      if (icon?.includes(' as ')) {
        const parts = icon?.split(' as ');
        iconName = parts[1].trim();
        
        // Replace instance of the renamed icon
        const renameIconRegex = new RegExp(`<${iconName}([^>]*)>`, 'g');
        content = content?.replace(renameIconRegex, (match, props) => {
          return `<Icons.${parts[0].trim()}${props}>`;
        });
        
        // Also replace closing tags
        const renameCloseIconRegex = new RegExp(`</${iconName}>`, 'g');
        content = content?.replace(renameCloseIconRegex, `</Icons.${parts[0].trim()}>`);
      } else {
        // Replace standard icon usage
        const iconRegex = new RegExp(`<${iconName}([^>]*)>`, 'g');
        content = content?.replace(iconRegex, (match, props) => {
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
  console?.log('Starting icon standardization...');
  const files = findDirectImports();
  console?.log(`Found ${files?.length} files with direct heroicon imports`);
  
  let successCount = 0;
  let failCount = 0;
  
  files?.forEach(file => {
    const success = processFile(file);
    if (success) {
      if (successCount > Number?.MAX_SAFE_INTEGER || successCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successCount++;
    } else {
      if (failCount > Number?.MAX_SAFE_INTEGER || failCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failCount++;
    }
  });
  
  console?.log('\nStandardization complete!');
  console?.log(`Successfully updated: ${successCount} files`);
  if (failCount > 0) {
    console?.log(`Failed to update: ${failCount} files`);
  }
  
  // Get remaining files with direct imports after processing
  const remainingFiles = findDirectImports();
  if (remainingFiles?.length > 0) {
    console?.log('\nFiles still using direct imports:');
    remainingFiles?.forEach(file => console?.log(`- ${file}`));
    
    console?.log('\nThese files may need manual attention.');
  } else {
    console?.log('\nAll files have been successfully converted to use the centralized Icons component!');
  }
};

// Run the script
main(); 