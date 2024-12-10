import { PersistentStorageService } from '../services/PersistentStorageService';
import { NotificationsService } from '../services/NotificationsService'
import { DeviceInfoService } from '../services/DeviceInfoService'

export const useConfigLoader = () => {
  const loadConfig = async () => {
    let selectedCountry = await PersistentStorageService.getSafe<'UK' | 'ROI' | undefined>(
      'selected_country',
      undefined,
    );

    if (!selectedCountry) {
      selectedCountry = DeviceInfoService.getSelectedCountry();

      // Save config only for the first launch
      await NotificationsService.saveConfig({
        country: selectedCountry,
      });

      await PersistentStorageService.setSafe('selected_country', selectedCountry);
    }

    await NotificationsService.initializeWithSavedConfig();
    // ...other initializations, e.g. accept language header
  };

  return {
    loadConfig,
  };
};
