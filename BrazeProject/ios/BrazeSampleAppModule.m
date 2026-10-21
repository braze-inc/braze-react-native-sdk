#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>

/// Sample-app-only module to re-request an OS push token after unregisterPush().
@interface BrazeSampleApp : NSObject <RCTBridgeModule>
@end

@implementation BrazeSampleApp

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

RCT_EXPORT_METHOD(registerForRemoteNotifications:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  UNAuthorizationOptions options =
      UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound;
  [center requestAuthorizationWithOptions:options
                        completionHandler:^(BOOL granted, NSError *_Nullable error) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (error != nil) {
        reject(@"PUSH_AUTHORIZATION_ERROR", error.localizedDescription, error);
        return;
      }
      // Trigger APNs registration regardless of the prompt outcome so a token
      // is re-delivered when notifications were already authorized.
      (void)granted;
      [[UIApplication sharedApplication] registerForRemoteNotifications];
      resolve(nil);
    });
  }];
}

@end
