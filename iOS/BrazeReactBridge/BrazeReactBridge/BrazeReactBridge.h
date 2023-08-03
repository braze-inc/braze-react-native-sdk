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

/// Intializes the Braze instance based on a configuration. This same instance is also used by the Braze bridge.
/// - Parameters:
///   - configuration: The customizable configuration from the host app.
+ (Braze *)initBraze:(BRZConfiguration *)configuration;

@end
