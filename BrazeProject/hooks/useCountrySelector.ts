import { PersistentStorageService } from '../services/PersistentStorageService';
import { NotificationsService } from '../services/NotificationsService';
import { DeviceInfoService } from '../services/DeviceInfoService';

export const useCountrySelector = () => {
  const selectLocation = async (nextSelectedCountry: 'UK' | 'ROI') => {
    await PersistentStorageService.setSafe('selected_country', nextSelectedCountry);
    await NotificationsService.saveConfig({
      country: nextSelectedCountry,
    });

    /*
      Reload the app as this is the most convenient way to re-init all things.
      Otherwise we need to put re-init logic directly here
    */
    DeviceInfoService.restartBundle();
  };

  const onSelectUKPress = () => {
    selectLocation('UK');
  };

  const onSelectROIPress = () => {
    selectLocation('ROI');
  };

  return {
    onSelectUKPress,
    onSelectROIPress,
  };
};
