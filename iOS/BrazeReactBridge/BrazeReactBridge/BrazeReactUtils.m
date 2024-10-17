#import "BrazeReactUtils.h"
#import <React/RCTLog.h>

@implementation BrazeReactUtils

static BrazeReactUtils *sharedInstance;

- (instancetype)init {
  self = [super init];
  self.initialUrlString = nil;
  self.initialPushPayload = nil;
  return self;
}

+ (BrazeReactUtils *)sharedInstance {
  if (!sharedInstance) {
    sharedInstance = [[BrazeReactUtils alloc] init];
  }
  return sharedInstance;
}

- (BOOL)populateInitialPayloadFromLaunchOptions:(NSDictionary *)launchOptions {
  NSDictionary *pushDictionary = [launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  BRZNotificationsPayload *notificationPayload = [[BRZNotificationsPayload alloc] initWithUserInfo:pushDictionary
                                                                         type:BRZNotificationsPayloadTypeOpened
                                                                        silent:NO];
  if (notificationPayload) {
    sharedInstance.initialPushPayload = [self formatPushPayload:notificationPayload withLaunchOptions:launchOptions];
    NSLog(@"Initial iOS push payload set to %@.", sharedInstance.initialPushPayload);
  } else {
    sharedInstance.initialPushPayload = nil;
  }

  return sharedInstance.initialPushPayload;
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

- (NSDictionary *)formatPushPayload:(BRZNotificationsPayload *)payload withLaunchOptions:(NSDictionary *) launchOptions {
  NSMutableDictionary *eventData = [NSMutableDictionary dictionary];

  // Uses the `"push_` prefix for consistency with Android.
  switch (payload.type) {
    case BRZNotificationsPayloadTypeOpened:
      eventData[@"payload_type"] = @"push_opened";
      break;
    case BRZNotificationsPayloadTypeReceived:
      eventData[@"payload_type"] = @"push_received";
      break;
  }

  // If the push was received while the app was in a terminated state, get the initial URL and sets it as the notification url. Otherwise, use the `urlContext`.
  if (launchOptions) {
    NSDictionary *pushDictionary = [launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
    if (pushDictionary && pushDictionary[@"aps"] && pushDictionary[@"ab_uri"]) {
      eventData[@"url"] = pushDictionary[@"ab_uri"];
    }
  } else {
    eventData[@"url"] = [payload.urlContext.url absoluteString];
  }

  eventData[@"use_webview"] = [NSNumber numberWithBool:payload.urlContext.useWebView];
  eventData[@"title"] = payload.title;
  eventData[@"body"] = payload.body;
  eventData[@"summary_text"] = payload.subtitle;
  eventData[@"badge_count"] = payload.badge;
  eventData[@"timestamp"] = [NSNumber numberWithInteger:(NSInteger)[payload.date timeIntervalSince1970]];
  eventData[@"is_silent"] = [NSNumber numberWithBool:payload.isSilent];
  eventData[@"is_braze_internal"] = [NSNumber numberWithBool:payload.isInternal];
  eventData[@"braze_properties"] = filterBrazeProperties(payload.userInfo);

  // Attaches the image URL from the `userInfo` payload if it exists. This is a no-op otherwise.
  eventData[@"image_url"] = payload.userInfo[@"ab"][@"att"][@"url"];

  // Adds relevant iOS-specific properties.
  NSMutableDictionary *iosProperties = [NSMutableDictionary dictionary];
  iosProperties[@"action_identifier"] = payload.actionIdentifier;
  iosProperties[@"aps"] = payload.userInfo[@"aps"];
  eventData[@"ios"] = iosProperties;

  return eventData;
}

/**
 * Strips the raw payload dictionary to only include Braze key-value pairs.
 */
static NSDictionary *filterBrazeProperties(NSDictionary *userInfo) {
  NSMutableDictionary *userInfoCopy = [userInfo mutableCopy];
  userInfoCopy[@"ab"] = nil;
  userInfoCopy[@"ab_uri"] = nil;
  userInfoCopy[@"aps"] = nil;
  userInfoCopy[@"ab_use_webview"] = nil;
  return userInfoCopy;
}

@end
