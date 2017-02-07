#import "AppboyReactUtils.h"
#import <React/RCTLog.h>

@implementation AppboyReactUtils

static AppboyReactUtils *sharedInstance;

- (instancetype)init {
  self = [super init];
  self.initialUrlString = nil;
  return self;
}

+ (AppboyReactUtils *)sharedInstance {
  if (!sharedInstance) {
    sharedInstance = [[AppboyReactUtils alloc] init];
  }
  return sharedInstance;
}

// If the push dictionary from application:didFinishLaunchingWithOptions: launchOptions has an Appboy deep link (ab_uri), we store it in initialUrlString
- (BOOL)populateInitialUrlFromLaunchOptions:(NSDictionary *)launchOptions {
  NSDictionary *pushDictionary = [launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (pushDictionary && pushDictionary[@"aps"] && pushDictionary[@"ab_uri"]) {
    sharedInstance.initialUrlString = pushDictionary[@"ab_uri"];
    RCTLogInfo(@"[AppboyReactUtils sharedInstance].initialUrlString set to %@.", sharedInstance.initialUrlString);
    return true;
  }
  sharedInstance.initialUrlString = nil;
  return false;
}

@end
