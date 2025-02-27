#import <BrazeKit/BrazeKit-Swift.h>
#import <React/RCTBridge.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

@interface BrazeBannerView : RCTViewComponentView
#else
#import "RCTView.h"
@interface BrazeBannerView : RCTView
#endif

@end
