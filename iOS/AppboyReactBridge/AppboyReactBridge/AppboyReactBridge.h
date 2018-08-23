#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// TODO (Brian) - Modify header/library search paths to be more generic or assume node installation
@interface AppboyReactBridge : RCTEventEmitter <RCTBridgeModule>

@end
