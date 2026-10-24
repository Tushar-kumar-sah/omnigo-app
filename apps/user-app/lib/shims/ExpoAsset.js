import { requireOptionalNativeModule } from 'expo-modules-core';

// Safe runtime resolution for ExpoAsset in Expo Go
const AssetModule =
  typeof requireOptionalNativeModule === 'function'
    ? requireOptionalNativeModule('ExpoAsset')
    : null;

export async function downloadAsync(url, md5Hash, type) {
  if (AssetModule && typeof AssetModule.downloadAsync === 'function') {
    try {
      return await AssetModule.downloadAsync(url, md5Hash, type);
    } catch (_) {}
  }
  return url;
}

export default {
  downloadAsync,
};
