const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const { resolver: { sourceExts, assetExts } } = defaultConfig;

  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      nodeModulesPaths: [
        path.resolve(__dirname, 'node_modules'),          // For the `mobile` folder
        path.resolve(__dirname, '../node_modules'),      // For the root `frontend` folder
      ],
    },
    watchFolders: [
      path.resolve(__dirname, '../shared'),             // Ensure shared is watched
      path.resolve(__dirname, '..'),                    // Watch the root directory as well
    ],
  };
})();
