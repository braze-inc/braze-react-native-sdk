#import "BrazeReactUtils.h"
#import <React/RCTLog.h>

@implementation BrazeReactUtils

static BrazeReactUtils *sharedInstance;

- (instancetype)init {
  self = [super init];
  self.initialUrlString = nil;
  return self;
}

+ (BrazeReactUtils *)sharedInstance {
  if (!sharedInstance) {
    sharedInstance = [[BrazeReactUtils alloc] init];
  }
  return sharedInstance;
}

// If the push dictionary from application:didFinishLaunchingWithOptions: launchOptions has a Braze deep link (ab_uri), we store it in initialUrlString
- (BOOL)populateInitialUrlFromLaunchOptions:(NSDictionary *)launchOptions {
  NSDictionary *pushDictionary = [launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (pushDictionary && pushDictionary[@"aps"] && pushDictionary[@"ab_uri"]) {
    sharedInstance.initialUrlString = pushDictionary[@"ab_uri"];
    RCTLogInfo(@"[BrazeReactUtils sharedInstance].initialUrlString set to %@.", sharedInstance.initialUrlString);
    return true;
  }
  sharedInstance.initialUrlString = nil;
  return false;
}

- (BOOL)populateInitialUrlForCategories:(NSDictionary *)userInfo {
  // When action buttons are opened, didFinishLaunchingWithOptions's launchOptions are always nil.
  if (sharedInstance.initialUrlString) {
    NSLog(@"initialUrlString already populated in didFinishLaunchingWithOptions. Doing nothing.");
    return false;
  }
  NSDictionary *categories = [userInfo valueForKeyPath:@"ab.ab_cat"];
  if (categories && [categories count] > 0) {
    NSDictionary *category = [[categories allValues] objectAtIndex:0];
    if (category[@"a_uri"]) {
      sharedInstance.initialUrlString = category[@"a_uri"];
      RCTLogInfo(@"[BrazeReactUtils sharedInstance].initialUrlString set to %@.", sharedInstance.initialUrlString);
      return true;
    }
  }
  sharedInstance.initialUrlString = nil;
  return false;
}

@end
