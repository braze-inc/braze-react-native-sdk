#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_REMAP_MODULE(BrazeDynamicConfigurationBridge, BrazeDynamicConfigurationBridge, NSObject)
RCT_EXTERN_METHOD(saveConfig: (NSDictionary)configOptions resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(initializeWithSavedConfig: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
