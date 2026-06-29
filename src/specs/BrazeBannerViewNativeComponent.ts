import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes';

type BannerDimensionsEvent = {
  // Use `Double` from CodegenTypes because `number` types are not supported as a bubbling event type.
  height: Double;
};

type BannerDismissEvent = {
  placementId: string;
  stableKey: string;
  trackingId: string;
};

export interface BrazeBannerViewProps extends ViewProps {
  placementId: string;
  onHeightChanged?: BubblingEventHandler<BannerDimensionsEvent> | null;
  onBannerDismiss?: BubblingEventHandler<BannerDismissEvent> | null;
}

export default codegenNativeComponent<BrazeBannerViewProps>(
  "BrazeBannerView"
) as HostComponent<BrazeBannerViewProps>;
