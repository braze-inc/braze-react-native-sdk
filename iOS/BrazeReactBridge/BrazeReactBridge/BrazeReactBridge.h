#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

#import <BrazeKit/BrazeKit-Swift.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <BrazeReactModuleSpec/BrazeReactModuleSpec.h>
@interface BrazeReactBridge: RCTEventEmitter <NativeBrazeReactModuleSpec>
#else
#import <React/RCTBridgeModule.h>
@interface BrazeReactBridge: RCTEventEmitter <RCTBridgeModule>
#endif

/// Uses an existing native-owned instance without changing its authentication delegate or IAM presenter/delegate.
/// Call on the main thread. Active React Native event subscriptions move to this instance.
/// JavaScript `initialize` calls are ignored while a native-owned instance is attached.
+ (void)useNativeBrazeInstance:(Braze * _Nonnull)instance;

/// Intializes the Braze instance based on a configuration. This same instance is also used by the Braze bridge.
/// - Parameters:
///   - configuration: The customizable configuration from the host app.
+ (Braze *)initBraze:(BRZConfiguration *)configuration
    __attribute__((deprecated("Use BrazeReactInitializer.configure(_:postInitialization:) to set up configuration, then call Braze.initialize(apiKey, endpoint) from JavaScript.")));

@end
