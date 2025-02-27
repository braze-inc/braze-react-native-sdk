#import "BrazeBannerManager.h"
#import "BrazeBannerView.h"

@implementation BrazeBannerManager

RCT_EXPORT_MODULE(BrazeBannerView)

RCT_EXPORT_VIEW_PROPERTY(placementID, NSString *)
RCT_EXPORT_VIEW_PROPERTY(onHeightChanged, RCTBubblingEventBlock)

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (UIView *)view {
  return [BrazeBannerView new];
}

@end
