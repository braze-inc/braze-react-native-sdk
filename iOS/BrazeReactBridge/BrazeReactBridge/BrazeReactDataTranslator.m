#import "BrazeReactDataTranslator.h"
#import <React/RCTLog.h>

/* Special keys when formatting the payloads from the native SDK */
static NSDictionary *const kInAppMessageSpecialCases = @{
  @"url": @"uri",
  @"use_webview": @"useWebView",
  @"image_alt": @"imageAltText",
  @"message_close": @"dismissType",
  @"type": @"messageType",
  @"btns": @"buttons",
  @"bg_color": @"backgroundColor",
  @"close_btn_color": @"closeButtonColor",
  @"icon_bg_color": @"iconBackgroundColor"
};

@implementation BrazeReactDataTranslator

#pragma mark - In-app messages

/**
 * Formats a Braze in-app message for consumption in the Javascript layer.
 */
+ (NSDictionary *)formatInAppMessage:(BRZInAppMessageRaw *)message {
  if (!message) {
    NSLog(@"In-app message to format is nil. Returning nil.");
    return nil;
  }
  NSData *messageData = [message json];
  if (!messageData) {
    NSLog(@"In-app message JSON to format is nil. Returning nil.");
    return nil;
  }
  NSError* error = nil;
  id messageJSON = [NSJSONSerialization JSONObjectWithData:messageData
                                                   options:NSJSONReadingMutableContainers
                                                     error:&error];
  if (error || !messageJSON) {
    NSLog(@"Unable to parse In-App Message: %@", error.description);
    return nil;
  } else if (![messageJSON isKindOfClass:[NSDictionary class]]) {
    NSLog(@"Parsed In-App Message JSON is not a dictionary");
    return nil;
  }

  NSMutableDictionary *formattedMessageJSON =
      [[BrazeReactDataTranslator formatToCamelCase:messageJSON
                                    keysToPreserve:@[@"extras"]
                                      specialCases:kInAppMessageSpecialCases] mutableCopy];

  // Manually add for conversion back from JS -> iOS layer
  NSString *messageString = [[NSString alloc] initWithData:messageData
                                                  encoding:NSUTF8StringEncoding];
  formattedMessageJSON[@"inAppMessageJsonString"] = messageString;

  NSDictionary *formattedData = @{
    @"inAppMessage": formattedMessageJSON
  };
  return formattedData;
}

#pragma mark - Push notifications

+ (NSDictionary *)formatPushPayload:(BRZNotificationsPayload *)payload withLaunchOptions:(NSDictionary *)launchOptions {
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

  // Convert the timestamp to milliseconds.
  double timestamp = [payload.date timeIntervalSince1970];
  NSInteger timestampInMilliseconds = (NSInteger)(timestamp * 1000.0);
  eventData[@"timestamp"] = [NSNumber numberWithInteger:timestampInMilliseconds];

  eventData[@"is_silent"] = [NSNumber numberWithBool:payload.isSilent];
  eventData[@"is_braze_internal"] = [NSNumber numberWithBool:payload.isInternal];
  eventData[@"braze_properties"] = [BrazeReactDataTranslator filterBrazeProperties:payload.userInfo];

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
+ (NSDictionary *)filterBrazeProperties:(NSDictionary *)userInfo {
  NSMutableDictionary *userInfoCopy = [userInfo mutableCopy];
  userInfoCopy[@"ab"] = nil;
  userInfoCopy[@"ab_uri"] = nil;
  userInfoCopy[@"aps"] = nil;
  userInfoCopy[@"ab_use_webview"] = nil;
  return userInfoCopy;
}

#pragma mark - JSON formatting

/**
 * Converts all dictionary keys from snake_case to camelCase format. It will convert
 * the keys of nested dictionaries and arrays containing dictionaries.
 * - Parameter original: The original dictionary with snake_case keys.
 * - Parameter keysToPreserve: An array of keys to preserve during conversion.
 * - Parameter specialCases: Special cases where the key of the entry should be replaced
 *                           by the specified value.
 * - Returns: A new dictionary with keys properly formatted to camelCase.
 */
+ (NSDictionary *)formatToCamelCase:(NSDictionary *)original
                     keysToPreserve:(NSArray<NSString *> *)keysToPreserve
                       specialCases:(NSDictionary<NSString *, NSString *> *)specialCases {
  if (![original isKindOfClass:[NSDictionary class]]) {
    return original;
  }

  NSMutableDictionary *newDict = [NSMutableDictionary dictionary];
  for (NSString *key in original) {
    id value = original[key];

    if ([keysToPreserve containsObject:key]) {
      // Add value with original key
      newDict[key] = value;

    } else {
      NSString *camelKey = specialCases[key] ?: [BrazeReactDataTranslator snakeToCamelCase:key];
      if (!camelKey) {
        continue;
      }
      [BrazeReactDataTranslator addValueToDict:newDict
                                      camelKey:camelKey
                                         value:value
                                keysToPreserve:keysToPreserve
                                  specialCases:specialCases];
    }
  }
  return newDict;
}

/**
 * Converts a snake_case string to camelCase format:
 *   e.g. "is_test_send" -> "isTestSend"
 */
+ (NSString *)snakeToCamelCase:(NSString *)snakeString {
  if (!snakeString || [snakeString length] == 0) {
    return nil;
  }
  NSArray *components = [snakeString componentsSeparatedByString:@"_"];
  NSMutableString *camelString = [NSMutableString stringWithString:components[0]];

  for (NSInteger i = 1; i < components.count; i++) {
    NSString *component = components[i];
    if (component.length > 0) {
      NSString *capitalLetter = [[component substringToIndex:1] uppercaseString];
      NSString *capitalComponent = [component stringByReplacingCharactersInRange:NSMakeRange(0,1)
                                                                      withString:capitalLetter];
      [camelString appendString:capitalComponent];
    }
  }
  return [camelString copy];
}

/**
 * Adds a value to the dictionary with a camelCase key.
 */
+ (void)addValueToDict:(NSMutableDictionary *)dict
              camelKey:(NSString *)camelKey
                 value:(id)value
        keysToPreserve:(NSArray<NSString *> *)keysToPreserve
          specialCases:(NSDictionary<NSString *, NSString *> *)specialCases {
  if ([value isKindOfClass:[NSDictionary class]]) {
    dict[camelKey] = [BrazeReactDataTranslator formatToCamelCase:value
                                                  keysToPreserve:keysToPreserve
                                                    specialCases:specialCases];

  } else if ([value isKindOfClass:[NSArray class]]) {
    dict[camelKey] = [BrazeReactDataTranslator convertKeysToCamelCase:value
                                                       keysToPreserve:keysToPreserve
                                                         specialCases:specialCases];

  } else {
    // Primitive value
    dict[camelKey] = value;
  }
}

/**
 * Converts the keys of any nested objects in the array to camelCase, if present.
 */
+ (NSMutableArray *)convertKeysToCamelCase:(NSArray *)array
                            keysToPreserve:(NSArray<NSString *> *)keysToPreserve
                              specialCases:(NSDictionary<NSString *, NSString *> *)specialCases {
  NSMutableArray *newArray = [NSMutableArray array];
  for (id item in array) {
    if ([item isKindOfClass:[NSDictionary class]]) {
      [newArray addObject:[BrazeReactDataTranslator formatToCamelCase:item
                                                       keysToPreserve:keysToPreserve
                                                         specialCases:specialCases]];
    } else {
      [newArray addObject:item];
    }
  }
  return [newArray mutableCopy];
}

@end
