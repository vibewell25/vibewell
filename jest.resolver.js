module.exports = (path, options) => {
  // Call the default resolver
  return options.defaultResolver(path, {
    ...options,
    // Ensure package.json is properly resolved
    packageFilter: pkg => {
      // Redirect module field to main
      if (pkg.module) {
        delete pkg.module;
      }
      return pkg;
    },
  });
}; 