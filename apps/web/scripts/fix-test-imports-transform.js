/**
 * A jscodeshift transform to fix hyphenated default import names in test files.
 * For each import of the form:
 *    import foo-bar from './foo-bar';
 * it'll convert to:
 *    import FooBar from './foo-bar';
 */
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Helper: convert hyphenated names to PascalCase
  function toPascalCase(name) {
    return name
      .split(/[-_]/g)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
  }

  let hasModifications = false;

  root.find(j.ImportDeclaration)
    .filter(path => {
      // Only default imports
      return path.node.specifiers.some(
        spec => spec.type === 'ImportDefaultSpecifier'
      );
    })
    .forEach(path => {
      const importPath = path.node.source.value;
      // Extract filename without extension
      const segments = importPath.split('/');
      const fileNamePart = segments[segments.length - 1];
      const base = fileNamePart.replace(/\.(tsx?|jsx?)$/, '');
      if (base.includes('-')) {
        const pascal = toPascalCase(base);
        // Update the import specifier name
        j(path).replaceWith(j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(pascal))],
          j.literal(importPath)
        ));
        hasModifications = true;
      }
    });

  return hasModifications ? root.toSource({ quote: 'single' }) : null;
}; 