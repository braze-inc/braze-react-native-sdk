import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes';

type BrazeBannerDimensionsEvent = {
  // Use `Double` from CodegenTypes because `number` types are not supported as a bubbling event type.
  height: Double;
};

export interface BrazeBannerViewProps extends ViewProps {
  placementID: string;
  onHeightChanged?: BubblingEventHandler<BrazeBannerDimensionsEvent> | null;
}

export default codegenNativeComponent<BrazeBannerViewProps>(
  "BrazeBannerView"
) as HostComponent<BrazeBannerViewProps>;
