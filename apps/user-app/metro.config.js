const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the entire monorepo for changes
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Disable the package.json "exports" field resolution (causes issues with some packages)
config.resolver.unstable_enablePackageExports = false;

// 4. Fix Windows absolute path / empty-module bug in metro-resolver
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName && moduleName.includes('empty-module')) {
    return { type: 'empty' };
  }
  if (path.isAbsolute(moduleName) && fs.existsSync(moduleName)) {
    try {
      if (fs.statSync(moduleName).isFile()) {
        return { type: 'sourceFile', filePath: moduleName };
      }
    } catch (_) {}
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
