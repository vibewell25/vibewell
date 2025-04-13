#!/usr/bin/env node

/**
 * Component Documentation Generator
 * 
 * This script helps to create consistent documentation for React components.
 * It can be used to generate documentation templates for existing components or
 * to validate documentation of existing components.
 * 
 * Usage:
 *   - Generate template for a component: node scripts/generate-component-docs.js --component Button
 *   - Validate docs for a directory: node scripts/generate-component-docs.js --validate src/components/ui
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { program } = require('commander');

// Configure the CLI
program
  .option('-c, --component <name>', 'Component name to generate documentation for')
  .option('-d, --dir <directory>', 'Directory to look for component files', 'src/components')
  .option('-v, --validate <directory>', 'Validate documentation for all components in directory')
  .option('-f, --fix', 'Fix missing documentation (use with --validate)')
  .parse(process.argv);

const options = program.opts();

/**
 * Generate a documentation template for a component
 * @param {string} componentName - Name of the component
 * @param {string} directory - Directory to look for the component
 */
async function generateComponentDocs(componentName, directory) {
  try {
    // Find the component file
    const files = glob.sync(`${directory}/**/${componentName}.tsx`);
    
    if (files.length === 0) {
      console.error(`Component ${componentName} not found in ${directory}`);
      return;
    }
    
    console.log(`Found component file: ${files[0]}`);
    
    // Read the component file
    const fileContent = fs.readFileSync(files[0], 'utf8');
    
    // Parse the component to extract props interface
    const ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });
    
    // Extract component props interface
    let propsInterface = null;
    let componentFunction = null;
    
    traverse(ast, {
      TSInterfaceDeclaration(path) {
        if (path.node.id.name.includes('Props')) {
          propsInterface = path.node;
        }
      },
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === componentName) {
          componentFunction = path.node;
        }
      },
      VariableDeclaration(path) {
        const declarations = path.node.declarations;
        for (const decl of declarations) {
          if (decl.id.name === componentName) {
            componentFunction = decl.init;
          }
        }
      }
    });
    
    // Generate documentation template
    let docTemplate = `/**
 * ${componentName} Component
 * 
 * Description: A component that... [add component description here]
 * 
 * @component
`;
    
    // Add props documentation
    if (propsInterface) {
      docTemplate += ` * 
 * @typedef ${propsInterface.id.name}
`;
      
      propsInterface.body.body.forEach(prop => {
        const propName = prop.key.name;
        const isOptional = prop.optional ? '(optional)' : '';
        let type = '';
        
        if (prop.typeAnnotation) {
          // Extract type information
          const typeNode = prop.typeAnnotation.typeAnnotation;
          if (typeNode.type === 'TSStringKeyword') {
            type = 'string';
          } else if (typeNode.type === 'TSNumberKeyword') {
            type = 'number';
          } else if (typeNode.type === 'TSBooleanKeyword') {
            type = 'boolean';
          } else if (typeNode.type === 'TSUnionType') {
            type = typeNode.types.map(t => {
              if (t.type === 'TSLiteralType') {
                return t.literal.value;
              }
              return t.type.replace('TS', '').replace('Keyword', '').toLowerCase();
            }).join(' | ');
          } else {
            type = typeNode.type.replace('TS', '').replace('Keyword', '').toLowerCase();
          }
        }
        
        docTemplate += ` * @param {${type}} ${propName} - ${isOptional} [add description here]
`;
      });
    }
    
    // Add example usage
    docTemplate += ` * 
 * @example
 * ```tsx
 * <${componentName} />
 * ```
 */`;
    
    console.log('\nGenerated Documentation Template:');
    console.log(docTemplate);
    
    // Option to save the documentation
    if (options.fix) {
      const updatedContent = docTemplate + '\n\n' + fileContent;
      fs.writeFileSync(files[0], updatedContent);
      console.log(`\nDocumentation added to ${files[0]}`);
    } else {
      console.log('\nTo save this documentation to the component file, run with --fix flag.');
    }
    
  } catch (error) {
    console.error('Error generating documentation:', error);
  }
}

/**
 * Validate documentation for components in a directory
 * @param {string} directory - Directory to validate
 * @param {boolean} fix - Whether to fix missing documentation
 */
async function validateComponentDocs(directory, fix) {
  try {
    // Find all component files
    const files = glob.sync(`${directory}/**/*.tsx`);
    
    console.log(`Found ${files.length} component files in ${directory}`);
    
    let undocumentedComponents = 0;
    let wellDocumentedComponents = 0;
    
    for (const file of files) {
      const componentName = path.basename(file, '.tsx');
      const fileContent = fs.readFileSync(file, 'utf8');
      
      // Check if component has JSDoc documentation
      if (!fileContent.includes('/**') || !fileContent.includes('@component')) {
        console.log(`\nMissing documentation: ${componentName} (${file})`);
        undocumentedComponents++;
        
        // If fix flag is set, generate documentation
        if (fix) {
          await generateComponentDocs(componentName, path.dirname(file));
        }
      } else {
        wellDocumentedComponents++;
      }
    }
    
    console.log('\nDocumentation Summary:');
    console.log(`- Well documented components: ${wellDocumentedComponents}`);
    console.log(`- Undocumented components: ${undocumentedComponents}`);
    
    if (undocumentedComponents > 0 && !fix) {
      console.log('\nTo automatically add documentation templates, run with --fix flag.');
    }
    
  } catch (error) {
    console.error('Error validating documentation:', error);
  }
}

// Main execution
async function main() {
  if (options.component) {
    await generateComponentDocs(options.component, options.dir);
  } else if (options.validate) {
    await validateComponentDocs(options.validate, options.fix);
  } else {
    console.log('Please specify either --component or --validate option.');
    program.help();
  }
}

main(); 