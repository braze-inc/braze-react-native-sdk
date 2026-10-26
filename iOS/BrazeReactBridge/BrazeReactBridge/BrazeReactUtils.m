#import "BrazeReactUtils.h"
#import "BrazeReactDataTranslator.h"
#import <React/RCTLog.h>

@implementation BrazeReactUtils

static Braze * _Nullable sharedBraze;
static BrazeReactUtils * _Nullable sharedInstance;

- (instancetype)init {
  self = [super init];
  self.initialUrlString = nil;
  self.initialPushPayload = nil;
  return self;
}

+ (BrazeReactUtils *)sharedInstance {
  // Ensure thread-safe initialization of the singleton.
  // The block executes exactly once, even when called concurrently from multiple threads,
  // preventing race conditions and duplicate allocations.
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[BrazeReactUtils alloc] init];
  });
  return sharedInstance;
}

+ (void)setBraze:(Braze * _Nullable)braze {
  sharedBraze = braze;
}

+ (Braze * _Nullable)braze {
  return sharedBraze;
}

- (BOOL)populateInitialPayloadFromLaunchOptions:(NSDictionary *)launchOptions {
  NSDictionary *pushDictionary = [launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (!pushDictionary) {
    pushDictionary = @{};
  }
  return [self populateInitialPayloadFromPushDictionary:pushDictionary];
}

- (BOOL)populateInitialPayloadFromNotificationResponse:(UNNotificationResponse *)response {
  // Scene connections without a notification response must not overwrite a payload that was already captured.
  // Action button launches never populate the launch options, so only the default action is stored.
  if (!response || ![response.actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]) {
    RCTLogInfo(@"No default action notification response. Not changing initialPushPayload.");
    return sharedInstance.initialPushPayload != nil;
  }
  return [self populateInitialPayloadFromPushDictionary:response.notification.request.content.userInfo];
}

- (BOOL)populateInitialPayloadFromPushDictionary:(NSDictionary *)pushDictionary {
  BRZNotificationsPayload *notificationPayload = [[BRZNotificationsPayload alloc] initWithUserInfo:pushDictionary
                                                                         type:BRZNotificationsPayloadTypeOpened
                                                                        silent:NO];
  if (notificationPayload) {
    NSString *launchUrl = pushDictionary[@"aps"] ? pushDictionary[@"ab_uri"] : nil;
    sharedInstance.initialPushPayload = [BrazeReactDataTranslator formatPushPayload:notificationPayload withUrlOverride:launchUrl];
    NSLog(@"Initial iOS push payload set to %@.", sharedInstance.initialPushPayload);
  } else {
    sharedInstance.initialPushPayload = nil;
    RCTLogInfo(@"No push notification found. Not setting initialPushPayload.");
  }

  return sharedInstance.initialPushPayload != nil;
}

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
