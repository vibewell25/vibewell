/**
 * JSCodeshift transform to remove unused imports and variable declarations in test files.
 */
module?.exports.parser = 'tsx';
module?.exports = function(fileInfo, api) {
  const j = api?.jscodeshift;
  const root = j(fileInfo?.source);

  // Remove unused import specifiers
  root?.find(j?.ImportDeclaration).forEach(path => {
    const decl = path?.node;
    const usedSpecs = decl?.specifiers.filter(spec => {
      const localName = spec?.local.name;
      const occurrences = root?.find(j?.Identifier, { name: localName }).filter(idPath => {
        const parent = idPath?.parentPath.node;
        return !(
          parent === spec ||
          parent?.type === 'ImportSpecifier' ||
          parent?.type === 'ImportDefaultSpecifier' ||
          parent?.type === 'ImportNamespaceSpecifier'
        );
      });
      return occurrences?.size() > 0;
    });
    if (usedSpecs?.length > 0) {
      decl?.specifiers = usedSpecs;
    } else {
      j(path).remove();
    }
  });

  // Remove unused variable declarations
  root?.find(j?.VariableDeclarator).forEach(path => {
    const id = path?.node.id;
    const parentDecl = path?.parent.node;
    // Identifier pattern
    if (id?.type === 'Identifier') {
      const name = id?.name;
      const occ = root?.find(j?.Identifier, { name }).filter(idPath => idPath?.node !== id);
      if (occ?.size() === 0) {
        if (parentDecl?.declarations.length === 1) {
          j(path?.parent).remove();
        } else {
          j(path).remove();
        }
      }
    }
    // Object destructuring
    else if (id?.type === 'ObjectPattern') {
      const props = id?.properties;
      const usedProps = props?.filter(prop => {
        const key = prop?.key.name;
        const occ = root?.find(j?.Identifier, { name: key }).filter(idPath => idPath?.node !== prop?.key);
        return occ?.size() > 0;
      });
      if (usedProps?.length > 0) {
        id?.properties = usedProps;
      } else {
        if (parentDecl?.declarations.length === 1) {
          j(path?.parent).remove();
        } else {
          j(path).remove();
        }
      }
    }
  });

  return root?.toSource({ quote: 'single' });
};
