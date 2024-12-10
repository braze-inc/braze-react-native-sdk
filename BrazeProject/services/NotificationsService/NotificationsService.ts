import { NativeModules } from 'react-native';

import { Config } from './Config';

const { BrazeDynamicConfigurationBridge } = NativeModules;

export namespace NotificationsService {
  interface SaveConfigParams {
    country: 'ROI' | 'UK';
  }

  export async function saveConfig(params: SaveConfigParams) {
    try {
      await BrazeDynamicConfigurationBridge.saveConfig(Config[params.country]);
    } catch (error) {
      console.error(error);
    }
  }

  export async function initializeWithSavedConfig() {
    try {
      await BrazeDynamicConfigurationBridge.initializeWithSavedConfig();
    } catch (error) {
      console.error(error);
    }
  }

}
