#import "BrazeBannerView.h"
#import "BrazeBannerUIHelper.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <react/renderer/components/BrazeReactModuleSpec/ComponentDescriptors.h>
#import <react/renderer/components/BrazeReactModuleSpec/EventEmitters.h>
#import <react/renderer/components/BrazeReactModuleSpec/Props.h>
#import <react/renderer/components/BrazeReactModuleSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface BrazeBannerView () <RCTBrazeBannerViewViewProtocol>
@end
#endif

@implementation BrazeBannerView {
  BrazeBannerUIHelper *_uiHelper;
}

/// Default initializer triggered by the `RCTComponentViewFactory` when used as a Fabric Component.
- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    if (!_uiHelper) {
      _uiHelper = [BrazeBannerUIHelper new];
    }

    #ifdef RCT_NEW_ARCH_ENABLED
    static const auto defaultProps = std::make_shared<const BrazeBannerViewProps>();
    _props = defaultProps;
    #endif
  }
  return self;
}

#pragma mark - RCT Property Lifecycle Methods
// These methods are automatically interpreted and called by React Native when the properties are set from JavaScript.

- (void)setPlacementID:(NSString *)placementId {
  __weak BrazeBannerView *weakSelf = self;

  dispatch_async(dispatch_get_main_queue(), ^{
    __strong BrazeBannerView *strongSelf = weakSelf;
    if (strongSelf) {
      // Remove any existing banner views before replacing with a new one.
      [strongSelf->_uiHelper resizeView:strongSelf withHeight:[NSNumber numberWithDouble:0]];
      for (UIView *subview in strongSelf.subviews) {
        [subview removeFromSuperview];
      }
      // Pass execution over to the UI helper since Objective-C++ cannot directly call into Swift.
      [strongSelf->_uiHelper insertPlacement:placementId intoView:strongSelf];
    }
  });
}

- (void)setOnHeightChanged:(RCTBubblingEventBlock)onHeightChanged {
  _uiHelper.onHeightChanged = ^(double value) {
    onHeightChanged(@{@"height": @(value)});
  };
}

#ifdef RCT_NEW_ARCH_ENABLED
/// This method is the Fabric equivalent of the setter methods above.
/// Instead of automatically invoking those methods, React Native passes properties to the Fabric view via this method.
- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps = *std::static_pointer_cast<BrazeBannerViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<BrazeBannerViewProps const>(props);

  if (oldViewProps.placementID != newViewProps.placementID) {
    NSString *placementIdString = [[NSString alloc] initWithCString:newViewProps.placementID.c_str()
                                                           encoding:NSASCIIStringEncoding];
    [self setPlacementID:placementIdString];
  }

  if (!_uiHelper.onHeightChanged) {
    __weak BrazeBannerView *weakSelf = self;

    _uiHelper.onHeightChanged = ^(double height) {
      BrazeBannerViewEventEmitter::OnHeightChanged result = BrazeBannerViewEventEmitter::OnHeightChanged();
      result.height = height;
      __strong BrazeBannerView *strongSelf = weakSelf;
      if (strongSelf->_eventEmitter) {
        strongSelf.eventEmitter.onHeightChanged(result);
      }
    };
  }

  [super updateProps:props oldProps:oldProps];
}

- (const BrazeBannerViewEventEmitter &)eventEmitter
{
  return static_cast<const BrazeBannerViewEventEmitter &>(*_eventEmitter);
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<BrazeBannerViewComponentDescriptor>();
}

Class<RCTComponentViewProtocol> BrazeBannerViewCls(void)
{
  return BrazeBannerView.class;
}
#endif

@end
