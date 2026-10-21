import { NativeModules } from 'react-native';

type BrazeSampleAppNativeModule = {
  registerForRemoteNotifications: () => Promise<void>;
};

const { BrazeSampleApp } = NativeModules as {
  BrazeSampleApp?: BrazeSampleAppNativeModule;
};

/**
 * Asks the OS for a fresh push token and lets Braze's automatic push
 * integration forward it. Sample-app only.
 */
export function registerForRemoteNotifications(): Promise<void> {
  if (BrazeSampleApp?.registerForRemoteNotifications == null) {
    return Promise.reject(
      new Error('BrazeSampleApp native module is not available'),
    );
  }
  return BrazeSampleApp.registerForRemoteNotifications();
}
