#import "BrazeBannerUIHelper.h"
#import "BrazeReactUtils.h"
#import <React/RCTUIManager.h>

@import BrazeUI;

@implementation BrazeBannerUIHelper

- (void)insertPlacement:(NSString *)placementID
               intoView:(UIView *)hostView {
  Braze *braze = [BrazeReactUtils braze];
  if (braze) {
    BRZBannerUIView *bannerView = [[BRZBannerUIView alloc] initWithPlacementId:placementID
                                                                         braze:braze
                                                         processContentUpdates:^(BrazeBannerUIContentUpdates * updates,
                                                                                 NSError * error) {
      if (error) {
        NSLog(@"Error updating banner: %@", error);
        return;
      }

      if (updates.height) {
        [self resizeView:hostView
              withHeight:updates.height];
      }
    }];
    [hostView addSubview:bannerView];

    // Constrain banner view to the edges of the host component `UIView`.
    bannerView.translatesAutoresizingMaskIntoConstraints = NO;
    [NSLayoutConstraint activateConstraints:@[
      [bannerView.leadingAnchor constraintEqualToAnchor:hostView.leadingAnchor],
      [bannerView.trailingAnchor constraintEqualToAnchor:hostView.trailingAnchor],
      [bannerView.topAnchor constraintEqualToAnchor:hostView.topAnchor],
      [bannerView.bottomAnchor constraintEqualToAnchor:hostView.bottomAnchor],
    ]];
  }
}

- (void)resizeView:(UIView *)view withHeight:(NSNumber *)height {
  // Constrain native host view to HTML content height.
  CGFloat heightAsFloat = [height doubleValue];
  [NSLayoutConstraint activateConstraints:@[
    [view.heightAnchor constraintEqualToConstant:heightAsFloat]
  ]];

  // Notify the React Native view of the updated content size.
  CGRect frame = view.frame;
  frame.size.width = view.superview.frame.size.width;
  frame.size.height = heightAsFloat;

  if (_onHeightChanged) {
    _onHeightChanged(heightAsFloat);
  }
}

@end
