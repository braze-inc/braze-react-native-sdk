import { requireNativeComponent, StyleSheet } from 'react-native';
import React, { useState } from 'react';

const isFabricEnabled = global.nativeFabricUIManager != null;
const NativeBannerView = isFabricEnabled ? require('../specs/BrazeBannerViewNativeComponent').default : requireNativeComponent('BrazeBannerView');

const BannerView = ({ onHeightChanged, onDismiss, style, placementId, ...props }) => {
  const [height, setHeight] = useState(0);

  const handleHeightChanged = (event) => {
    const newHeight = event.nativeEvent.height;
    setHeight(newHeight);
    if (onHeightChanged) {
      onHeightChanged(newHeight);
    }
  };

  const handleDismiss = (event) => {
    if (onDismiss) {
      onDismiss(event.nativeEvent);
    }
  };

  const overriddenWidth = StyleSheet.flatten(style)?.width;
  const overriddenHeight = StyleSheet.flatten(style)?.height;

  const combinedStyle = StyleSheet.flatten([style, {
    width: overriddenWidth || '100%',
    height: overriddenHeight || height,
  }]);

  return (
    <NativeBannerView
      {...props}
      style={combinedStyle}
      placementId={placementId}
      onHeightChanged={handleHeightChanged}
      onBannerDismiss={handleDismiss}
    />
  );
};
export default BannerView;
