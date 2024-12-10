import RNRestart from 'react-native-restart';

export namespace DeviceInfoService {
  export const getSelectedCountry = (): 'UK' | 'ROI' => {
    // Here should be a real call to system's APIs
    return 'UK';
  };

  export const restartBundle = () => {
    RNRestart.restart();
  };
}
