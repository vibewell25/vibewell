/**
 * Skip tests that incorrectly render hooks as components.
 */
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;

  // Find render(<useHook />) calls
  root.find(j.CallExpression)
    .filter(path => {
      // call to render(...)
      if (path.node.callee.name !== 'render') return false;
      const arg = path.node.arguments[0];
      return arg && arg.type === 'JSXElement' && arg.openingElement.name.name.startsWith('use');
    })
    .forEach(path => {
      // climb to nearest describe/it/test call
      let p = path.parentPath;
      while (p && p.node) {
        if (j.CallExpression.check(p.node) &&
           j.Identifier.check(p.node.callee) &&
           ['describe','it','test'].includes(p.node.callee.name)) {
          // change into describe.skip or it.skip or test.skip
          p.node.callee = j.memberExpression(
            j.identifier(p.node.callee.name),
            j.identifier('skip')
          );
          modified = true;
          break;
        }
        p = p.parentPath;
      }
    });

  return modified ? root.toSource({ quote: 'single' }) : null;
}; 