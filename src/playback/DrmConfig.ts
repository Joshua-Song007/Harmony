import shaka from 'shaka-player';

export const AMAZON_WIDEVINE_LICENSE_URL =
  'https://license.music.amazon.com/widevine/license';

export function buildDrmConfig(): shaka.extern.DrmConfiguration {
  return {
    servers: {
      'com.widevine.alpha': AMAZON_WIDEVINE_LICENSE_URL,
    },
    advanced: {
      'com.widevine.alpha': {
        videoRobustness: 'SW_SECURE_CRYPTO',
        audioRobustness: 'SW_SECURE_CRYPTO',
      },
    },
    retryParameters: {
      maxAttempts: 3,
      baseDelay: 1000,
      backoffFactor: 2,
      fuzzFactor: 0.5,
      timeout: 30000,
      stallTimeout: 0,
      connectionTimeout: 0,
    },
  } as unknown as shaka.extern.DrmConfiguration;
}
