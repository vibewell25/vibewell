// A jscodeshift codemod to convert import paths' filename segments to kebab-case
module.exports = function(fileInfo, { jscodeshift: j }, options) {
  const root = j(fileInfo.source);
  root.find(j.ImportDeclaration).forEach(path => {
    const oldSource = path.node.source.value;
    if (typeof oldSource !== 'string') return;
    // Only process relative import paths
    if (!oldSource.startsWith('.')) return;
    const parts = oldSource.split('/');
    const last = parts.pop();
    // Remove extension if present
    const match = last.match(/^(.*?)(\.(ts|tsx))?$/);
    const base = match ? match[1] : last;
    // Convert CamelCase or PascalCase to kebab-case
    const kebab = base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    parts.push(kebab);
    // Reconstruct path
    const newSource = parts.join('/');
    path.node.source.value = newSource;
  });
  return root.toSource({ quote: 'single' });
}; 