const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Fix Windows NTFS / OneDrive / pnpm reparse point EINVAL bug in Metro file-map
if (process.platform === 'win32') {
  const origReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (targetPath, ...args) {
    try {
      return await origReadlink.call(this, targetPath, ...args);
    } catch (err) {
      if (err && err.code === 'EINVAL') {
        return targetPath;
      }
      throw err;
    }
  };
  const origReadlinkSync = fs.readlinkSync;
  fs.readlinkSync = function (targetPath, ...args) {
    try {
      return origReadlinkSync.call(this, targetPath, ...args);
    } catch (err) {
      if (err && err.code === 'EINVAL') {
        return targetPath;
      }
      throw err;
    }
  };
}

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Ensure all monorepo packages and node_modules are in watchFolders
config.watchFolders = Array.from(
  new Set([
    ...(config.watchFolders || []),
    monorepoRoot,
    path.resolve(monorepoRoot, 'node_modules'),
    path.resolve(projectRoot, 'node_modules'),
  ])
);

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = Array.from(
  new Set([
    ...(config.resolver.nodeModulesPaths || []),
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ])
);

// 3. Fix Windows absolute path / empty-module bug in metro-resolver
const emptyModulePath = require.resolve('metro-runtime/src/modules/empty-module.js');
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (context.fileSystemLookup && !context.__pnpmFsPatched) {
    context.__pnpmFsPatched = true;
    const origLookup = context.fileSystemLookup.bind(context);
    context.fileSystemLookup = (filePath) => {
      const res = origLookup(filePath);
      if (res && res.exists) return res;
      if (fs.existsSync(filePath)) {
        try {
          const stat = fs.statSync(filePath);
          return {
            exists: true,
            realPath: fs.realpathSync(filePath),
            type: stat.isFile() ? 'f' : stat.isDirectory() ? 'd' : 'other',
          };
        } catch (_) {}
      }
      return res;
    };
    if (context.doesFileExist) {
      const origDoesFileExist = context.doesFileExist.bind(context);
      context.doesFileExist = (filePath) => {
        return origDoesFileExist(filePath) || fs.existsSync(filePath);
      };
    }
  }

  // Safe shim for ExpoAsset native module in Expo Go
  if (
    moduleName === './ExpoAsset' ||
    moduleName === '../ExpoAsset' ||
    moduleName === 'expo-asset/build/ExpoAsset' ||
    moduleName.endsWith('/ExpoAsset') ||
    moduleName.endsWith('/ExpoAsset.js')
  ) {
    const shimPath = path.resolve(__dirname, 'lib/shims/ExpoAsset.js');
    if (fs.existsSync(shimPath)) {
      return { type: 'sourceFile', filePath: shimPath };
    }
  }

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

// 4. Patch DependencyGraph.prototype.getOrComputeSha1 for pnpm symlinks on Windows
try {
  const metroPath = require.resolve('metro');
  const depGraphPath = path.resolve(path.dirname(metroPath), 'node-haste/DependencyGraph.js');
  const DependencyGraph = require(depGraphPath).default;
  if (DependencyGraph && DependencyGraph.prototype) {
    const origGetSha1 = DependencyGraph.prototype.getOrComputeSha1;
    DependencyGraph.prototype.getOrComputeSha1 = async function (mixedPath) {
      try {
        const result = await origGetSha1.call(this, mixedPath);
        if (result && result.sha1) return result;
      } catch (err) {
        if (fs.existsSync(mixedPath)) {
          try {
            const content = fs.readFileSync(mixedPath);
            const crypto = require('node:crypto');
            const sha1 = crypto.createHash('sha1').update(content).digest('hex');
            return { sha1 };
          } catch (_) {}
        }
        throw err;
      }
      if (fs.existsSync(mixedPath)) {
        try {
          const content = fs.readFileSync(mixedPath);
          const crypto = require('node:crypto');
          const sha1 = crypto.createHash('sha1').update(content).digest('hex');
          return { sha1 };
        } catch (_) {}
      }
      return origGetSha1.call(this, mixedPath);
    };
  }
} catch (_) {}

module.exports = config;
