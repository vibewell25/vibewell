const { getDefaultConfig } = require('@expo/metro-config');

// Load default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// Register the expo-asset plugin to support hashing and loading static assets
config.transformer.assetPlugins = config.transformer.assetPlugins || [];
if (!config.transformer.assetPlugins.includes('expo-asset/tools/hashAssetFiles')) {
  config.transformer.assetPlugins.push('expo-asset/tools/hashAssetFiles');
// Ensure PNG assets are recognized by the resolver
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes('png')) {
  config.resolver.assetExts.push('png');
// Remove unsupported server.runInspectorProxy option to prevent validation warnings
if (config.server && config.server.runInspectorProxy !== undefined) {
  delete config.server.runInspectorProxy;
module.exports = config; 