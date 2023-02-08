#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@import BrazeKit;

@interface BrazeReactBridge : RCTEventEmitter <RCTBridgeModule, RCTBridgeDelegate>

/// Intializes the Braze instance based on a configuration. This same instance is also used by the Braze bridge.
/// - Parameters:
///   - configuration: The customizable configuration from the host app.
+ (Braze *)initBraze:(BRZConfiguration *)configuration;

@end
