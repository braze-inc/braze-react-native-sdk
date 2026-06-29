#import <BrazeKit/BrazeKit-Swift.h>
#import <React/RCTBridge.h>
#import <React/RCTComponent.h>

/**
 * Braze Banner UI helper class for interacting directly with BrazeUI.
 *
 * Objective-C++ cannot directly invoke Swift code, so this class bridges the gap from `BrazeBannerView`.
 */
@interface BrazeBannerUIHelper : NSObject

@property (nonatomic, copy) void (^_Nullable onHeightChanged)(double height);
@property (nonatomic, copy) void (^_Nullable onDismiss)(NSString *placementId, NSString *stableKey, NSString *trackingId);

- (void)insertPlacement:(NSString *_Nonnull)placementId
               intoView:(UIView *_Nonnull)hostView;
- (void)resizeView:(UIView *_Nonnull)view withHeight:(NSNumber *_Nonnull)height;
- (void)triggerHeightUpdate;

@end
