#import "BrazeReactBridge.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import <React/RCTBundleURLProvider.h>
#import <UserNotifications/UserNotifications.h>

#import "BrazeReactUtils.h"
#import "BrazeUIHandler.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <BrazeReactModuleSpec/BrazeReactModuleSpec.h>
#endif

static NSString *const kContentCardsUpdatedEvent = @"contentCardsUpdated";
static NSString *const kBannerCardsUpdatedEvent = @"bannerCardsUpdated";
static NSString *const kNewsFeedCardsUpdatedEvent = @"newsFeedCardsUpdated";
static NSString *const kFeatureFlagsUpdatedEvent = @"featureFlagsUpdated";
static NSString *const kSdkAuthenticationErrorEvent = @"sdkAuthenticationError";
static NSString *const kInAppMessageReceivedEvent = @"inAppMessageReceived";
static NSString *const kPushNotificationEvent = @"pushNotificationEvent";

@interface BrazeReactBridge () <BrazeSDKAuthDelegate>

@property (strong, nonatomic) BRZCancellable *contentCardsSubscription;
@property (strong, nonatomic) BRZCancellable *bannersSubscription;
@property (strong, nonatomic) BRZCancellable *featureFlagsSubscription;
@property (strong, nonatomic) BRZCancellable *newsFeedSubscription;
@property (strong, nonatomic) BRZCancellable *notificationSubscription;

@end

static Braze *braze;
static BrazeUIHandler *brazeUIHandler;

@implementation BrazeReactBridge {
  bool hasListeners;
}

#pragma mark - Setup

+ (Braze *)initBraze:(BRZConfiguration *)configuration {
  [configuration.api addSDKMetadata:@[BRZSDKMetadata.reactnative]];
  #ifdef RCT_NEW_ARCH_ENABLED
  [configuration.api addSDKMetadata:@[BRZSDKMetadata.reactnativenewarch]];
  #endif
  configuration.api.sdkFlavor = BRZSDKFlavorReact;
  Braze *instance = [[Braze alloc] initWithConfiguration:configuration];
  braze = instance;
  brazeUIHandler = [[BrazeUIHandler alloc] init];
  [brazeUIHandler setDefaultInAppMessagePresenter:braze];
  [BrazeReactUtils setBraze:braze];
  return instance;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

RCT_EXPORT_MODULE()

/// The `startObserving` method will be called as soon as the first `Braze.addListener` method is called.
- (void)startObserving {
  hasListeners = YES;
  braze.sdkAuthDelegate = self;
  brazeUIHandler.eventEmitter = self;

  self.contentCardsSubscription = [braze.contentCards subscribeToUpdates:^(NSArray<BRZContentCardRaw *> * _Nonnull cards) {
    RCTLogInfo(@"Received Content Cards array via subscription of length: %lu", [cards count]);
    NSMutableDictionary *eventData = [NSMutableDictionary dictionary];
    eventData[@"cards"] = RCTFormatContentCards(cards);
    [self sendEventWithName:kContentCardsUpdatedEvent body:eventData];
  }];
  self.bannersSubscription = [braze.banners subscribeToUpdates:^(NSDictionary<NSString *,BRZBanner *> * _Nonnull banners) {
    RCTLogInfo(@"Received Banner Cards array via subscription of length: %lu", [banners count]);
    NSMutableDictionary *eventData = [NSMutableDictionary dictionary];
    eventData[@"banners"] = RCTFormatBanners(banners);
    [self sendEventWithName:kBannerCardsUpdatedEvent body:eventData];
  }];
  self.featureFlagsSubscription = [braze.featureFlags subscribeToUpdates:^(NSArray<BRZFeatureFlag *> * _Nonnull featureFlags) {
    RCTLogInfo(@"Received Feature Flags array via subscription of length: %lu", [featureFlags count]);
    [self sendEventWithName:kFeatureFlagsUpdatedEvent body:RCTFormatFeatureFlags(featureFlags)];
  }];
  self.newsFeedSubscription = [braze.newsFeed subscribeToUpdates:^(NSArray<BRZNewsFeedCard *> * _Nonnull cards) {
    RCTLogInfo(@"Received News Feed cards via subscription of length: %lu", [cards count]);
    [self sendEventWithName:kNewsFeedCardsUpdatedEvent body:nil];
  }];

  self.notificationSubscription = [braze.notifications subscribeToUpdates:^(BRZNotificationsPayload * _Nonnull payload) {
    RCTLogInfo(@"Received push notification via subscription");
    NSDictionary *eventData = [[BrazeReactUtils sharedInstance] formatPushPayload:payload withLaunchOptions:nil];
    [self sendEventWithName:kPushNotificationEvent body:eventData];
  }];

  // Assign a default IAM presenter delegate to publish IAM events to the JavaScript layer.
  if ([brazeUIHandler canSetDefaultInAppMessagePresenterDelegate:braze]) {
    [brazeUIHandler useDefaultPresenterDelegate:braze];
  }
}

- (void)stopObserving {
  hasListeners = NO;
  braze.sdkAuthDelegate = nil;
  [brazeUIHandler deinitPresenterDelegate:braze];
  self.contentCardsSubscription = nil;
  self.bannersSubscription = nil;
  self.newsFeedSubscription = nil;
  self.featureFlagsSubscription = nil;
  self.notificationSubscription = nil;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    kContentCardsUpdatedEvent,
    kBannerCardsUpdatedEvent,
    kNewsFeedCardsUpdatedEvent,
    kFeatureFlagsUpdatedEvent,
    kSdkAuthenticationErrorEvent,
    kInAppMessageReceivedEvent,
    kPushNotificationEvent
  ];

}

- (NSDictionary *)constantsToExport {
  return @{
    @"subscribed":@(BRZUserSubscriptionStateSubscribed),
    @"unsubscribed":@(BRZUserSubscriptionStateUnsubscribed),
    @"optedin":@(BRZUserSubscriptionStateOptedIn)
  };
};

- (BRZUserSubscriptionState)userSubscriptionStateFrom:(NSString *)stateString {
  if ([stateString isEqualToString: @"subscribed"]) {
    return BRZUserSubscriptionStateSubscribed;
  } else if ([stateString isEqualToString:@"unsubscribed"]) {
    return BRZUserSubscriptionStateUnsubscribed;
  } else if ([stateString isEqualToString:@"optedin"]) {
    return BRZUserSubscriptionStateOptedIn;
  } else {
    return BRZUserSubscriptionStateSubscribed;
  }
}

- (void)reportResultWithCallback:(RCTResponseSenderBlock)callback andError:(NSString *)error andResult:(id)result {
  if (callback != nil) {
    if (error != nil) {
      callback(@[error, [NSNull null]]);
    } else {
      callback(@[[NSNull null], (result != nil) ? result : @""]);
    }
  } else {
    RCTLogInfo(@"Warning: BrazeReactBridge callback was null.");
  }
}

#pragma mark - Bridge bindings

// (Deprecated) Returns push deep links from cold app starts.
// For more context see getInitialURL() in index.js
RCT_EXPORT_METHOD(getInitialURL:(RCTResponseSenderBlock)callback) {
  if ([BrazeReactUtils sharedInstance].initialUrlString != nil) {
    [self reportResultWithCallback:callback andError:nil andResult:[BrazeReactUtils sharedInstance].initialUrlString];
  } else {
    [self reportResultWithCallback:callback andError:nil andResult:nil];
  }
}

// Returns push payload from cold app starts.
// For more context see getInitialPushPayload() in index.js.
RCT_EXPORT_METHOD(getInitialPushPayload:(RCTResponseSenderBlock)callback) {
  if ([BrazeReactUtils sharedInstance].initialPushPayload != nil) {
    RCTLogInfo(@"getInitialPushPayload() called with initialPushPayload: %@", [BrazeReactUtils sharedInstance].initialPushPayload);
    [self reportResultWithCallback:callback andError:nil andResult:[BrazeReactUtils sharedInstance].initialPushPayload];
  } else {
    RCTLogInfo(@"getInitialPushPayload() called but `initialPushPayload` is null. To fix this, use populateInitialPayloadFromLaunchOptions() to populate the initial payload value.");
    [self reportResultWithCallback:callback andError:nil andResult:nil];
  }
}

RCT_EXPORT_METHOD(getDeviceId:(RCTResponseSenderBlock)callback) {
  NSString *deviceId = [braze deviceId];
  [self reportResultWithCallback:callback andError:nil andResult:deviceId];
}

RCT_EXPORT_METHOD(changeUser:(NSString *)userId signature:(NSString *)signature) {
  RCTLogInfo(@"braze changeUser with values %@ %@", userId, signature);
  [braze changeUser:userId sdkAuthSignature:signature];
}

RCT_EXPORT_METHOD(getUserId:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"getUserId called");
  [braze.user idWithCompletion:^(NSString * _Nullable userId) {
    if (!userId) {
      [self reportResultWithCallback:callback andError:@"User ID not found." andResult:userId];
      return;
    }
    [self reportResultWithCallback:callback andError:nil andResult:userId];
  }];
}

RCT_EXPORT_METHOD(addAlias:(NSString *)aliasName aliasLabel:(NSString *)aliasLabel) {
  RCTLogInfo(@"braze.user addAlias with values %@ %@", aliasName, aliasLabel);
  [braze.user addAlias:aliasName label:aliasLabel];
}

RCT_EXPORT_METHOD(registerPushToken:(NSString *)token) {
  RCTLogInfo(@"braze registerPushToken with token %@", token);
  // Convert the token (hex representation) to NSData
  NSMutableData* tokenData = [NSMutableData data];
  unsigned char wholeByte;
  char byteChars[3] = {'\0','\0','\0'};
  for (int i = 0; i < token.length / 2; i++) {
    byteChars[0] = [token characterAtIndex:i * 2];
    byteChars[1] = [token characterAtIndex:i * 2 + 1];
    wholeByte = strtol(byteChars, NULL, 16);
    [tokenData appendBytes:&wholeByte length:1];
  }
  [braze.notifications registerDeviceToken:tokenData];
}

RCT_EXPORT_METHOD(logCustomEvent:(NSString *)eventName
                  eventProperties:(NSDictionary *)eventProperties) {
  RCTLogInfo(@"braze logCustomEvent with eventName %@", eventName);
  if (!eventProperties) {
    [braze logCustomEvent:eventName];
    return;
  }
  [braze logCustomEvent:eventName properties:[self parseDictionary:eventProperties]];
}

- (NSDictionary *)parseDictionary:(NSDictionary *)dictionary {
  NSArray *keys = [dictionary allKeys];
  NSMutableDictionary *parsedDictionary = [dictionary mutableCopy];
  for (NSString *key in keys) {
    if ([dictionary[key] isKindOfClass:[NSDictionary class]]){
      id type = dictionary[key][@"type"];
      if ([type isKindOfClass:[NSString class]] && [type isEqualToString:@"UNIX_timestamp"]) {
        double timestamp = [dictionary[key][@"value"] doubleValue];
        NSDate* nativeDate = [NSDate dateWithTimeIntervalSince1970:(timestamp / 1000.0)];
        [parsedDictionary setObject:nativeDate forKey:key];
      } else {
        NSDictionary *dictProperty = (NSDictionary *)dictionary[key];
        [parsedDictionary setObject:[self parseDictionary:dictProperty] forKey:key];
      }
    } else if ([dictionary[key] isKindOfClass:[NSArray class]]) {
      NSArray *array = (NSArray *)dictionary[key];
      [parsedDictionary setObject:[self parseArray:array] forKey:key];
    }
  }

  return parsedDictionary;
}

- (NSArray *)parseArray:(NSArray *)array {
  NSMutableArray *parsedArray = [array mutableCopy];
  for (int i = 0; i < array.count; i++) {
    if ([array[i] isKindOfClass:[NSDictionary class]]){
      id type = array[i][@"type"];
      if ([type isKindOfClass:[NSString class]] && [type isEqualToString:@"UNIX_timestamp"]) {
        double timestamp = [array[i][@"value"] doubleValue];
        NSDate* nativeDate = [NSDate dateWithTimeIntervalSince1970:(timestamp / 1000.0)];
        parsedArray[i] = nativeDate;
      } else {
        NSDictionary *dictionary = (NSDictionary *)array[i];
        parsedArray[i] = [self parseDictionary:dictionary];
      }
    } else if ([array[i] isKindOfClass:[NSArray class]]) {
      NSArray *arrayProperty = (NSArray *)array[i];
      parsedArray[i] = [self parseArray:arrayProperty];
    }
  }

  return parsedArray;
}

RCT_EXPORT_METHOD(logPurchase:(NSString *)productId
                  price:(NSString *)price
           currencyCode:(NSString *)currencyCode
               quantity:(double)quantity
     purchaseProperties:(NSDictionary *)purchaseProperties) {
  RCTLogInfo(@"braze logPurchase with productIdentifier %@", productId);
  double decimalPrice = [[NSDecimalNumber decimalNumberWithString:price] doubleValue];
  if (!purchaseProperties) {
    [braze logPurchase:productId currency:currencyCode price:decimalPrice quantity:quantity];
    return;
  }

  [braze logPurchase:productId currency:currencyCode price:decimalPrice quantity:quantity properties:[self parseDictionary:purchaseProperties]];
}

#pragma mark - User Attributes

RCT_EXPORT_METHOD(setFirstName:(NSString *)firstName) {
  RCTLogInfo(@"braze.user.firstName =  %@", firstName);
  [braze.user setFirstName:firstName];
}

RCT_EXPORT_METHOD(setLastName:(NSString *)lastName) {
  RCTLogInfo(@"braze.user.lastName =  %@", lastName);
  [braze.user setLastName:lastName];
}

RCT_EXPORT_METHOD(setEmail:(NSString *)email) {
  RCTLogInfo(@"braze.user.email =  %@", email);
  [braze.user setEmail:email];
}

RCT_EXPORT_METHOD(setDateOfBirth:(double)year month:(double)month day:(double)day) {
  RCTLogInfo(@"braze.user.dateOfBirth =  %@", @"date");
  NSCalendar *calendar = [NSCalendar currentCalendar];
  NSDateComponents *components = [[NSDateComponents alloc] init];
  [components setDay:day];
  [components setMonth:month];
  [components setYear:year];
  NSDate *dateOfBirth = [calendar dateFromComponents:components];
  [braze.user setDateOfBirth:dateOfBirth];
}

RCT_EXPORT_METHOD(setCountry:(NSString *)country) {
  RCTLogInfo(@"braze.user.country =  %@", country);
  [braze.user setCountry:country];
}

RCT_EXPORT_METHOD(setHomeCity:(NSString *)homeCity) {
  RCTLogInfo(@"braze.user.homeCity =  %@", homeCity);
  [braze.user setHomeCity:homeCity];
}

RCT_EXPORT_METHOD(setGender:(NSString *)gender callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.gender =  %@", gender);
  if ([[gender capitalizedString] hasPrefix:@"F"]) {
    [braze.user setGender:BRZUserGender.female];
    [self reportResultWithCallback:callback
                          andError:nil
                         andResult:@(YES)];
  } else if ([[gender capitalizedString] hasPrefix:@"M"]) {
    [braze.user setGender:BRZUserGender.male];
    [self reportResultWithCallback:callback
                          andError:nil
                         andResult:@(YES)];
  } else if ([[gender capitalizedString] hasPrefix:@"N"]) {
    [braze.user setGender:BRZUserGender.notApplicable];
    [self reportResultWithCallback:callback
                          andError:nil
                         andResult:@(YES)];
  } else if ([[gender capitalizedString] hasPrefix:@"O"]) {
    [braze.user setGender:BRZUserGender.other];
    [self reportResultWithCallback:callback
                          andError:nil
                         andResult:@(YES)];
  } else if ([[gender capitalizedString] hasPrefix:@"P"]) {
    [braze.user setGender:BRZUserGender.preferNotToSay];
    [self reportResultWithCallback:callback
                          andError:nil
                         andResult:@(YES)];
  } else if ([[gender capitalizedString] hasPrefix:@"U"]) {
    [braze.user setGender:BRZUserGender.unknown];
    [self reportResultWithCallback:callback
                          andError:nil
                         andResult:@(YES)];
  } else {
    NSString *error = [NSString stringWithFormat:@"Invalid input %@. Gender not set.", gender];
    [self reportResultWithCallback:callback
                          andError:error
                         andResult:@(NO)];
  }
}

RCT_EXPORT_METHOD(setLanguage:(NSString *)language) {
  RCTLogInfo(@"braze.user.language =  %@", language);
  [braze.user setLanguage:language];
}

RCT_EXPORT_METHOD(setPhoneNumber:(NSString *)phone) {
  RCTLogInfo(@"braze.user.phone =  %@", phone);
  [braze.user setPhoneNumber:phone];
}

RCT_EXPORT_METHOD(addToSubscriptionGroup:(NSString *)groupId callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user addToSubscriptionGroupWithGroupId:groupId: =  %@", groupId);
  [braze.user addToSubscriptionGroupWithGroupId:groupId];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(removeFromSubscriptionGroup:(NSString *)groupId callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user removeFromSubscriptionGroup: =  %@", groupId);
  [braze.user removeFromSubscriptionGroupWithGroupId:groupId];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setEmailNotificationSubscriptionType:(NSString *)notificationSubscriptionType callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user.emailNotificationSubscriptionType =  %@", @"enum");
  BRZUserSubscriptionState emailNotificationSubscriptionType = [self userSubscriptionStateFrom:notificationSubscriptionType];
  [braze.user setEmailSubscriptionState:emailNotificationSubscriptionType];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setPushNotificationSubscriptionType:(NSString *)notificationSubscriptionType callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.pushNotificationSubscriptionType =  %@", @"enum");
  BRZUserSubscriptionState pushNotificationSubscriptionType = [self userSubscriptionStateFrom:notificationSubscriptionType];
  [braze.user setPushNotificationSubscriptionState:pushNotificationSubscriptionType];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setBoolCustomUserAttribute:(NSString *)key value:(BOOL)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndBoolValue: =  %@", key);
  [braze.user setCustomAttributeWithKey:key boolValue:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setStringCustomUserAttribute:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndStringValue: =  %@", key);
  [braze.user setCustomAttributeWithKey:key stringValue:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setDoubleCustomUserAttribute:(NSString *)key value:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndDoubleValue: =  %@", key);
  [braze.user setCustomAttributeWithKey:key doubleValue:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setDateCustomUserAttribute:(NSString *)key value:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndDateValue: =  %@", key);
  NSDate *date = [NSDate dateWithTimeIntervalSince1970:value];
  [braze.user setCustomAttributeWithKey:key dateValue:date];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setIntCustomUserAttribute:(NSString *)key value:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndIntValue: =  %@", key);
  NSInteger intValue = (NSInteger)value;
  [braze.user setCustomAttributeWithKey:key intValue:intValue];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setCustomUserAttributeObject:(NSString *)key
                  value:(NSDictionary *)value
                  merge:(BOOL)merge
                  callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomUserAttributeObject:object:: =  %@", key);
  [braze.user setNestedCustomAttributeDictionaryWithKey:key value:value merge:merge];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setCustomUserAttributeArray:(NSString *)key value:(NSArray *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomUserAttributeArray:array:: =  %@", key);
  for (id item in value) {
    if (![item isKindOfClass:[NSString class]]) {
      RCTLogInfo(@"Custom attribute array contains element that is not of type string. Aborting.");
      [self reportResultWithCallback:callback
                            andError:nil
                           andResult:@(NO)];
      return;
    }
  }
  [braze.user setCustomAttributeArrayWithKey:key array:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setCustomUserAttributeObjectArray:(NSString *)key value:(NSArray *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomUserAttributeObjectArray:array:: =  %@", key);
  for (id item in value) {
    if (![item isKindOfClass:[NSDictionary class]]) {
      RCTLogInfo(@"Custom attribute array contains element that is not of type object. Aborting.");
      [self reportResultWithCallback:callback
                            andError:nil
                           andResult:@(NO)];
      return;
    }
  }
  [braze.user setNestedCustomAttributeArrayWithKey:key value:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(unsetCustomUserAttribute:(NSString *)key callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user unsetCustomUserAttribute: =  %@", key);
  [braze.user unsetCustomAttributeWithKey:key];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(incrementCustomUserAttribute:(NSString *)key value:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user incrementCustomUserAttribute: =  %@", key);
  [braze.user incrementCustomUserAttribute:key by:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(addToCustomUserAttributeArray:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user addToCustomAttributeArray: =  %@", key);
  [braze.user addToCustomAttributeStringArrayWithKey:key value:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(removeFromCustomUserAttributeArray:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user removeFromCustomAttributeArrayWithKey: =  %@", key);
  [braze.user removeFromCustomAttributeStringArrayWithKey:key value:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setAttributionData:(NSString *)network campaign:(NSString *)campaign adGroup:(NSString *)adGroup creative:(NSString *)creative) {
  RCTLogInfo(@"braze.user setAttributionData");
  BRZUserAttributionData *attributionData = [[BRZUserAttributionData alloc]
                                             initWithNetwork:network
                                             campaign:campaign
                                             adGroup:adGroup
                                             creative:creative];
  [braze.user setAttributionData:attributionData];
}

RCT_EXPORT_METHOD(setLastKnownLocation:(double)latitude
                  longitude:(double)longitude
                  altitude:(double)altitude
                  horizontalAccuracy:(double)horizontalAccuracy
                  verticalAccuracy:(double)verticalAccuracy) {
  RCTLogInfo(@"setLastKnownLocationWithLatitude called with latitude: %g, longitude: %g, horizontalAccuracy: %g, altitude: %g, and verticalAccuracy: %g", latitude, longitude, horizontalAccuracy, altitude, verticalAccuracy);
  if (horizontalAccuracy < 0) {
    RCTLogInfo(@"Horizontal accuracy is invalid. This is a no-op in iOS.");
  } else if (verticalAccuracy < 0) {
    // Having an invalid `verticalAccuracy` will automatically nullify `altitude` in the Swift SDK.
    [braze.user setLastKnownLocationWithLatitude:latitude longitude:longitude horizontalAccuracy:horizontalAccuracy];
  } else {
    [braze.user setLastKnownLocationWithLatitude:latitude longitude:longitude altitude:altitude horizontalAccuracy:horizontalAccuracy verticalAccuracy:verticalAccuracy];
  }
}

#pragma mark - News Feed

RCT_EXPORT_METHOD(launchNewsFeed) {
  RCTLogInfo(@"News Feed UI not supported on iOS");
}

RCT_EXPORT_METHOD(requestFeedRefresh) {
  [braze.newsFeed requestRefresh];
}

RCT_EXPORT_METHOD(getNewsFeedCards:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getNewsFeedCards called");
  [self requestFeedRefresh];
  resolve([self getMappedNewsFeedCards]);
}

RCT_EXPORT_METHOD(logNewsFeedCardClicked:(NSString *)idString) {
  BRZNewsFeedCard *cardToClick = [self getNewsFeedCardById:idString];
  if (cardToClick) {
    RCTLogInfo(@"logNewsFeedCardClicked with id %@", idString);
    [cardToClick logClickUsing:braze];
  }
}

RCT_EXPORT_METHOD(logNewsFeedCardImpression:(NSString *)idString) {
  BRZNewsFeedCard *cardToClick = [self getNewsFeedCardById:idString];
  if (cardToClick) {
    RCTLogInfo(@"logNewsFeedCardImpression with id %@", idString);
    [cardToClick logImpressionUsing:braze];
  }
}

- (NSArray *)getMappedNewsFeedCards {
  NSArray<BRZNewsFeedCard *> *newsFeedCards = braze.newsFeed.cards;
  NSMutableArray *mappedNewsFeedCards = [NSMutableArray arrayWithCapacity:[newsFeedCards count]];
  [newsFeedCards enumerateObjectsUsingBlock:^(id card, NSUInteger idx, BOOL *stop) {
    [mappedNewsFeedCards addObject:RCTFormatNewsFeedCard(card)];
  }];
  return mappedNewsFeedCards;
}

- (nullable BRZNewsFeedCard *)getNewsFeedCardById:(NSString *)idString {
  NSArray<BRZNewsFeedCard *> *cards = braze.newsFeed.cards;
  NSPredicate *predicate = [NSPredicate predicateWithFormat:@"identifier == %@", idString];
  NSArray *filteredArray = [cards filteredArrayUsingPredicate:predicate];

  if ([filteredArray count]) {
    return filteredArray[0];
  }
  return nil;
}

/// Custom decoding function to match the News Feed Card format expected by the JS layer.
/// - Note: The output intentionally differs from the native `[card json]` method.
static NSDictionary *RCTFormatNewsFeedCard(BRZNewsFeedCard *card) {
  NSMutableDictionary *newsFeedCardData = [NSMutableDictionary dictionary];
  newsFeedCardData[@"id"] = card.identifier;
  newsFeedCardData[@"created"] = @(card.created);
  newsFeedCardData[@"expiresAt"] = @(card.expires);
  newsFeedCardData[@"viewed"] = @(card.viewed);
  newsFeedCardData[@"url"] = RCTNullIfNil(card.url ? card.url.absoluteString : nil);
  newsFeedCardData[@"openURLInWebView"] = @(card.useWebView);
  newsFeedCardData[@"extras"] = card.extras ? RCTJSONClean(card.extras) : @{};

  switch (card.type) {
    case BRZNewsFeedCardTypeBanner:
      newsFeedCardData[@"image"] = RCTNullIfNil(card.image ? card.image.absoluteString : nil);
      newsFeedCardData[@"imageAspectRatio"] = @(card.imageAspectRatio);
      newsFeedCardData[@"domain"] = RCTNullIfNil(card.domain);
      newsFeedCardData[@"type"] = @"Banner";
    case BRZNewsFeedCardTypeCaptionedImage:
      newsFeedCardData[@"image"] = RCTNullIfNil(card.image ? card.image.absoluteString : nil);
      newsFeedCardData[@"imageAspectRatio"] = @(card.imageAspectRatio);
      newsFeedCardData[@"title"] = card.title;
      newsFeedCardData[@"cardDescription"] = card.cardDescription;
      newsFeedCardData[@"domain"] = RCTNullIfNil(card.domain);
      newsFeedCardData[@"type"] = @"Captioned";
    case BRZNewsFeedCardTypeClassic:
      newsFeedCardData[@"image"] = RCTNullIfNil(card.image ? card.image.absoluteString : nil);
      newsFeedCardData[@"cardDescription"] = card.cardDescription;
      newsFeedCardData[@"title"] = card.title;
      newsFeedCardData[@"domain"] = card.domain;
      newsFeedCardData[@"type"] = @"Classic";
    case BRZNewsFeedCardTypeTextAnnouncement:
      newsFeedCardData[@"title"] = card.title;
      newsFeedCardData[@"cardDescription"] = card.cardDescription;
      newsFeedCardData[@"domain"] = RCTNullIfNil(card.domain);
      newsFeedCardData[@"type"] = @"TextAnnouncement";
  }
  return newsFeedCardData;
}

#pragma mark - Content Cards

/// Returns the content card for the associated id, or nil if not found.
- (nullable BRZContentCardRaw *)getContentCardById:(NSString *)idString {
  NSArray<BRZContentCardRaw *> *cards = braze.contentCards.cards;
  NSPredicate *predicate = [NSPredicate predicateWithFormat:@"identifier == %@", idString];
  NSArray *filteredArray = [cards filteredArrayUsingPredicate:predicate];
  if ([filteredArray count]) {
    return filteredArray[0];
  }
  return nil;
}

RCT_EXPORT_METHOD(launchContentCards:(BOOL)dismissAutomaticallyOnCardClick) {
  RCTLogInfo(@"launchContentCards called");
  [brazeUIHandler launchContentCards:braze
                dismissAutomatically:dismissAutomaticallyOnCardClick];
}

RCT_EXPORT_METHOD(getContentCards:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getContentCards called");

  [braze.contentCards requestRefreshWithCompletion:^(
    NSArray<BRZContentCardRaw *> *_Nullable cards,
    NSError *_Nullable refreshError) {
      if (refreshError) {
        reject(@"Content Card refresh error", refreshError.description, refreshError);
        return;
      }
      resolve(RCTFormatContentCards(cards));
    }];
}

RCT_EXPORT_METHOD(getCachedContentCards:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    RCTLogInfo(@"getCachedContentCards called");
    resolve(RCTFormatContentCards([braze.contentCards cards]));
}

RCT_EXPORT_METHOD(logContentCardClicked:(NSString *)idString) {
  BRZContentCardRaw *cardToClick = [self getContentCardById:idString];
  if (cardToClick) {
    RCTLogInfo(@"logContentCardClicked with id %@", idString);
    [cardToClick logClickUsing:braze];
  }
}

RCT_EXPORT_METHOD(logContentCardDismissed:(NSString *)idString) {
  BRZContentCardRaw *cardToClick = [self getContentCardById:idString];
  if (cardToClick) {
    RCTLogInfo(@"logDismissed with id %@", idString);
    [cardToClick logDismissedUsing:braze];
  }
}

RCT_EXPORT_METHOD(logContentCardImpression:(NSString *)idString) {
  BRZContentCardRaw *cardToClick = [self getContentCardById:idString];
  if (cardToClick) {
    RCTLogInfo(@"logContentCardImpression with id %@", idString);
    [cardToClick logImpressionUsing:braze];
  }
}

RCT_EXPORT_METHOD(processContentCardClickAction:(NSString *)idString) {
  BRZContentCardRaw *cardToPerformAction = [self getContentCardById:idString];
  if (cardToPerformAction) {
      NSURL* url = cardToPerformAction.url;
      BOOL useWebView = cardToPerformAction.useWebView;
        
      if (url != nil) {
        RCTLogInfo(@"processContentCardClickAction trying %@", url);
        cardToPerformAction.context = [[BRZContentCardContext alloc] initWithCardRaw:cardToPerformAction using:braze];
        [cardToPerformAction.context processClickActionWithURL:url useWebView:useWebView];
      }
    } else {
      RCTLogInfo(@"processContentCardClickAction could not parse card");
    }
}

static NSMutableArray *RCTFormatContentCards(NSArray<BRZContentCardRaw *> *cards) {
  NSMutableArray *mappedContentCards = [NSMutableArray arrayWithCapacity:[cards count]];
  [cards enumerateObjectsUsingBlock:^(id card, NSUInteger idx, BOOL *stop) {
    [mappedContentCards addObject:RCTFormatContentCard(card)];
  }];
  return mappedContentCards;
}

/// Custom decoding function to match the Content Card format expected by the JS layer.
/// - Note: The output intentionally differs from the native `[card json]` method.
static NSDictionary *RCTFormatContentCard(BRZContentCardRaw *card) {
  NSMutableDictionary *formattedContentCardData = [NSMutableDictionary dictionary];

  formattedContentCardData[@"id"] = card.identifier;
  formattedContentCardData[@"created"] = @(card.createdAt);
  formattedContentCardData[@"expiresAt"] = @(card.expiresAt);
  formattedContentCardData[@"viewed"] = @(card.viewed);
  formattedContentCardData[@"clicked"] = @(card.clicked);
  formattedContentCardData[@"pinned"] = @(card.pinned);
  formattedContentCardData[@"dismissed"] = @(card.removed);
  formattedContentCardData[@"dismissible"] = @(card.dismissible);
  formattedContentCardData[@"url"] = RCTNullIfNil(card.url ? card.url.absoluteString : nil);
  formattedContentCardData[@"openURLInWebView"] = @(card.useWebView);
  formattedContentCardData[@"isControl"] = @(NO);

  formattedContentCardData[@"extras"] = card.extras ? RCTJSONClean(card.extras) : @{};

  switch (card.type) {
    case BRZContentCardRawTypeCaptionedImage:
      formattedContentCardData[@"image"] = RCTNullIfNil(card.image ? card.image.absoluteString : nil);
      formattedContentCardData[@"imageAspectRatio"] = @(card.imageAspectRatio);
      formattedContentCardData[@"title"] = card.title;
      formattedContentCardData[@"cardDescription"] = card.cardDescription;
      formattedContentCardData[@"domain"] = RCTNullIfNil(card.domain);
      formattedContentCardData[@"type"] = @"Captioned";
      break;
    case BRZContentCardRawTypeImageOnly:
      formattedContentCardData[@"image"] = RCTNullIfNil(card.image ? card.image.absoluteString : nil);
      formattedContentCardData[@"imageAspectRatio"] = @(card.imageAspectRatio);
      formattedContentCardData[@"type"] = @"ImageOnly";
      break;
    case BRZContentCardRawTypeClassic:
      formattedContentCardData[@"image"] = RCTNullIfNil(card.image ? card.image.absoluteString : nil);
      formattedContentCardData[@"title"] = card.title;
      formattedContentCardData[@"cardDescription"] = card.cardDescription;
      formattedContentCardData[@"domain"] = RCTNullIfNil(card.domain);
      formattedContentCardData[@"type"] = @"Classic";
      break;
    case BRZContentCardRawTypeControl:
      formattedContentCardData[@"isControl"] = @(YES);
      break;
  }

  return formattedContentCardData;
}

#pragma mark - Banner Cards

RCT_EXPORT_METHOD(getBanner:(NSString *)placementId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  [braze.banners getBannerFor:placementId completion:^(BRZBanner * _Nullable banner) {
    if (!banner) {
      NSLog(@"No banner found for placementId: %@", placementId);
      resolve([NSNull null]);
      return;
    }
    resolve(RCTFormatBanner(banner));
  }];
}

RCT_EXPORT_METHOD(requestBannersRefresh:(NSArray *)placementIds) {
  [braze.banners requestBannersRefreshForPlacementIds:placementIds
                                           completion:^(NSDictionary<NSString *,BRZBanner *> * _Nullable banners, NSError * _Nullable error) {
    if (error) {
      // Use `RCTLogInfo` instead of `RCTLogError` to avoid throwing a hard error.
      RCTLogInfo(@"Error refreshing banners: %@", error);
    } else if (banners) {
      RCTLogInfo(@"Refreshed Banners.");
    }
  }];
}

static NSArray *RCTFormatBanners(NSDictionary<NSString *, BRZBanner *> *banners) {
  NSMutableArray *mappedBanners = [NSMutableArray arrayWithCapacity:[banners count]];
  [banners.allValues enumerateObjectsUsingBlock:^(BRZBanner *banner,
                                                  NSUInteger idx,
                                                  BOOL *stop) {
    [mappedBanners addObject:RCTFormatBanner(banner)];
  }];
  return mappedBanners;
}

static NSDictionary *RCTFormatBanner(BRZBanner *banner) {
  NSMutableDictionary *formattedBannerData = [NSMutableDictionary dictionary];

  formattedBannerData[@"trackingId"] = banner.identifier;
  formattedBannerData[@"placementId"] = banner.placementId;
  formattedBannerData[@"isTestSend"] = @(banner.isTestSend);
  formattedBannerData[@"isControl"] = @(banner.isControl);
  formattedBannerData[@"html"] = banner.html;
  formattedBannerData[@"expiresAt"] = @(banner.expiresAt);

  return formattedBannerData;
}

#pragma mark - Other bindings

RCT_EXPORT_METHOD(wipeData) {
  [braze wipeData];
}

RCT_EXPORT_METHOD(disableSDK) {
  [braze setEnabled:NO];
}

RCT_EXPORT_METHOD(enableSDK) {
  [braze setEnabled:YES];
}

RCT_EXPORT_METHOD(requestLocationInitialization) {
  RCTLogInfo(@"Warning: This is an Android only feature.");
}

RCT_EXPORT_METHOD(requestGeofences:(double)latitude longitude:(double)longitude) {
  RCTLogInfo(@"braze requestGeofencesWithLongitude:latitude: with latitude %g and longitude %g", latitude, longitude);
  [braze requestGeofencesWithLatitude:latitude longitude:longitude];
}

RCT_EXPORT_METHOD(getCardCountForCategories:(NSString *)category callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"News Feed helper methods not supported on iOS");
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(0)];
}

RCT_EXPORT_METHOD(getUnreadCardCountForCategories:(NSString *)category callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"News Feed helper methods not supported on iOS");
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(0)];
}

RCT_EXPORT_METHOD(requestImmediateDataFlush) {
  RCTLogInfo(@"requestImmediateDataFlush called");
  [braze requestImmediateDataFlush];
}

RCT_EXPORT_METHOD(setLocationCustomAttribute:(NSString *)key latitude:(double)latitude longitude:(double)longitude callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setLocationCustomAttribute:latitude:longitude:: =  %@", key);
  [braze.user setLocationCustomAttributeWithKey:key latitude:latitude longitude:longitude];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(requestContentCardsRefresh) {
  RCTLogInfo(@"requestContentCardsRefresh called");
  [braze.contentCards requestRefresh];
}

#pragma mark - SDK Authentication

RCT_EXPORT_METHOD(setSdkAuthenticationSignature:(NSString *)signature)
{
  RCTLogInfo(@"braze setSDKAuthenticationSignature with value: %@", signature);
  [braze setSDKAuthenticationSignature:signature];
}

- (void)braze:(Braze *)braze sdkAuthenticationFailedWithError:(BRZSDKAuthenticationError *)error {
  if (!hasListeners) {
    return;
  }

  NSMutableDictionary *errorJSON = [NSMutableDictionary dictionary];
  errorJSON[@"error_code"] = @(error.code);
  errorJSON[@"user_id"] = error.userId;
  errorJSON[@"original_signature"] = error.signature;
  errorJSON[@"reason"] = error.reason;
 [self sendEventWithName:kSdkAuthenticationErrorEvent body:errorJSON];
}

#pragma mark - Push Notifications

RCT_EXPORT_METHOD(requestPushPermission:(NSDictionary *)permissions) {
  UNAuthorizationOptions options = UNAuthorizationOptionNone;
  if ([permissions[@"alert"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionAlert;
  }
  if ([permissions[@"badge"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionBadge;
  }
  if ([permissions[@"sound"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionSound;
  }
  if ([permissions[@"provisional"] isEqual:@(YES)]) {
    if (@available(iOS 12.0, *)) {
      options |= UNAuthorizationOptionProvisional;
    }
  }

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center requestAuthorizationWithOptions:options
                        completionHandler:^(BOOL granted, NSError *_Nullable error) {
      if (error) {
          RCTLogInfo(@"Error while requesting permission: %@", error);
      } else {
          RCTLogInfo(@"Notification authorization, granted: %s", granted ? "true" : "false");
      }
  }];
}

#pragma mark - In-App Messages

RCT_EXPORT_METHOD(subscribeToInAppMessage:(BOOL)useBrazeUI
                  callback:(RCTResponseSenderBlock)callback) {
  if (![brazeUIHandler canSetDefaultInAppMessagePresenterDelegate:braze]) {
    // A custom delegate is being used. Do nothing.
    return;
  }
  brazeUIHandler.showInAppMessagesAutomaticallyInDefaultDelegate = useBrazeUI;
  [brazeUIHandler useDefaultPresenterDelegate:braze];
}

RCT_EXPORT_METHOD(hideCurrentInAppMessage) {
  RCTLogInfo(@"hideCurrentInAppMessage called");
  [brazeUIHandler dismissInAppMessage:braze];
}

RCT_EXPORT_METHOD(logInAppMessageClicked:(NSString *)inAppMessageString) {
  RCTLogInfo(@"logInAppMessageClicked called with value %@", inAppMessageString);
  BRZInAppMessageRaw *inAppMessage = [self getInAppMessageFromString:inAppMessageString braze:braze];
  if (inAppMessage) {
    [inAppMessage logClickWithButtonId:nil using:braze];
  }
}

RCT_EXPORT_METHOD(logInAppMessageImpression:(NSString *)inAppMessageString) {
  RCTLogInfo(@"logInAppMessageImpression called with value %@", inAppMessageString);
  BRZInAppMessageRaw *inAppMessage = [self getInAppMessageFromString:inAppMessageString braze:braze];
  if (inAppMessage) {
    [inAppMessage logImpressionUsing:braze];
  }
}

RCT_EXPORT_METHOD(performInAppMessageAction:(NSString *)inAppMessageString buttonId:(double)buttonId) {
  RCTLogInfo(@"performInAppMessageAction called with value %@", inAppMessageString);
  BRZInAppMessageRaw *inAppMessage = [self getInAppMessageFromString:inAppMessageString braze:braze];
  if (inAppMessage) {
    NSURL* url = nil;
    BOOL useWebView = NO;
    BRZInAppMessageRawClickAction clickAction = BRZInAppMessageRawClickActionURL;
      
    if (buttonId < 0) {
      url = inAppMessage.url;
      useWebView = inAppMessage.useWebView;
      clickAction = inAppMessage.clickAction;
    } else {
      for(int i = 0; i < inAppMessage.buttons.count; i++) {
        if (inAppMessage.buttons[i].identifier == buttonId) {
          url = inAppMessage.buttons[i].url;
          useWebView = inAppMessage.buttons[i].useWebView;
          clickAction = inAppMessage.buttons[i].clickAction;
        }
      }
    }
      
    RCTLogInfo(@"performInAppMessageAction trying %@", inAppMessage.url);
    inAppMessage.context = [[BRZInAppMessageContext alloc] initWithMessageRaw:inAppMessage using:braze];
    [inAppMessage.context processClickAction:clickAction url:url useWebView:useWebView];
  } else {
    RCTLogInfo(@"performInAppMessageAction could not parse inAppMessage");
  }
}

RCT_EXPORT_METHOD(logInAppMessageButtonClicked:(NSString *)inAppMessageString  buttonId:(double)buttonId) {
  RCTLogInfo(@"logInAppMessageButtonClicked called with value %@", inAppMessageString);

  BRZInAppMessageRaw *inAppMessage = [self getInAppMessageFromString:inAppMessageString braze:braze];
  if (inAppMessage) {
    [inAppMessage logClickWithButtonId:[@(buttonId) stringValue] using:braze];
  }
}

/// Returns the in-app message for the JSON string. If the JSON fails decoding, returns nil.
- (BRZInAppMessageRaw *)getInAppMessageFromString:(NSString *)inAppMessageJSONString
                                            braze:(Braze *)braze {
  NSData *inAppMessageData = [inAppMessageJSONString dataUsingEncoding:NSUTF8StringEncoding];
  BRZInAppMessageRaw *message = [BRZInAppMessageRaw decodingWithJson:inAppMessageData];
  if (message) {
    return message;
  }
  return nil;
}

#pragma mark - Feature Flags

RCT_EXPORT_METHOD(refreshFeatureFlags) {
  RCTLogInfo(@"refreshFeatureFlags called");
  [braze.featureFlags requestRefresh];
}

RCT_EXPORT_METHOD(logFeatureFlagImpression:(NSString *)flagId) {
  RCTLogInfo(@"logFeatureFlagImpression called for ID %@", flagId);
  [braze.featureFlags logFeatureFlagImpressionWithId:flagId];
}

RCT_EXPORT_METHOD(getFeatureFlag:(NSString *)flagId
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getFeatureFlag called for ID %@", flagId);
  BRZFeatureFlag *featureFlag = [braze.featureFlags featureFlagWithId:flagId];
  if (!featureFlag) {
    resolve([NSNull null]);
    return;
  }
  NSError* error = nil;
  id flagJSON = [NSJSONSerialization JSONObjectWithData:[featureFlag json]
                                                options:NSJSONReadingMutableContainers
                                                  error:&error];
  if (error) {
    reject(@"Unable to parse Feature Flag", error.description, error);
  } else {
    resolve(flagJSON);
  }
}

RCT_EXPORT_METHOD(getAllFeatureFlags:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getAllFeatureFlags called");
  NSArray<BRZFeatureFlag *> *mappedFeatureFlags = RCTFormatFeatureFlags(braze.featureFlags.featureFlags);
  resolve(mappedFeatureFlags);
}

RCT_EXPORT_METHOD(getFeatureFlagBooleanProperty:(NSString *)flagId
                  key:(NSString *)key
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getFeatureFlagBooleanProperty called for key %@", key);
  BRZFeatureFlag *featureFlag = [braze.featureFlags featureFlagWithId:flagId];
  NSNumber *boolProperty = [featureFlag boolPropertyForKey:key];
  // Return an explicit `NSNull` to avoid returning `undefined` in the JS layer.
  resolve(boolProperty ? boolProperty : [NSNull null]);
}

RCT_EXPORT_METHOD(getFeatureFlagStringProperty:(NSString *)flagId
                 key:(NSString *)key
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getFeatureFlagStringProperty called for key %@", key);
  BRZFeatureFlag *featureFlag = [braze.featureFlags featureFlagWithId:flagId];
  NSString *stringProperty = [featureFlag stringPropertyForKey:key];
  // Return an explicit `NSNull` to avoid returning `undefined` in the JS layer.
  resolve(stringProperty ? stringProperty : [NSNull null]);
}

RCT_EXPORT_METHOD(getFeatureFlagNumberProperty:(NSString *)flagId
                  key:(NSString *)key
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getFeatureFlagNumberProperty called for key %@", key);
  BRZFeatureFlag *featureFlag = [braze.featureFlags featureFlagWithId:flagId];
  NSNumber *numberProperty = [featureFlag numberPropertyForKey:key];
  // Return an explicit `NSNull` to avoid returning `undefined` in the JS layer.
  resolve(numberProperty ? numberProperty : [NSNull null]);
}

RCT_EXPORT_METHOD(getFeatureFlagJSONProperty:(NSString *)flagId
                               key:(NSString *)key
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getFeatureFlagJSONProperty called for key %@", key);
  BRZFeatureFlag *featureFlag = [braze.featureFlags featureFlagWithId:flagId];
  NSDictionary *jsonProperty = RCTJSONClean([featureFlag jsonPropertyForKey:key]);
  resolve(jsonProperty ? jsonProperty : [NSNull null]);
}

RCT_EXPORT_METHOD(getFeatureFlagTimestampProperty:(NSString *)flagId
                               key:(NSString *)key
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getFeatureFlagTimestampProperty called for key %@", key);
  BRZFeatureFlag *featureFlag = [braze.featureFlags featureFlagWithId:flagId];
  NSNumber *timestampProperty = [featureFlag timestampPropertyForKey:key];
  resolve(timestampProperty ? timestampProperty : [NSNull null]);
}

RCT_EXPORT_METHOD(getFeatureFlagImageProperty:(NSString *)flagId
                               key:(NSString *)key
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject) {
  RCTLogInfo(@"getFeatureFlagImageProperty called for key %@", key);
  BRZFeatureFlag *featureFlag = [braze.featureFlags featureFlagWithId:flagId];
  NSString *imageProperty = [featureFlag imagePropertyForKey:key];
  resolve(imageProperty ? imageProperty : [NSNull null]);
}

static NSArray *RCTFormatFeatureFlags(NSArray<BRZFeatureFlag *> *featureFlags) {
  NSMutableArray *mappedFeatureFlags = [NSMutableArray arrayWithCapacity:[featureFlags count]];
  [featureFlags enumerateObjectsUsingBlock:^(BRZFeatureFlag *flag, NSUInteger idx, BOOL *stop) {
    NSError* error = nil;
    id flagJSON = [NSJSONSerialization JSONObjectWithData:[flag json]
                                                  options:NSJSONReadingMutableContainers
                                                    error:&error];
    if (error) {
      RCTLogInfo(@"Unable to parse Feature Flag: %@, error: %@. Skipping.", flag, error);
    } else {
      [mappedFeatureFlags addObject:flagJSON];
    }
  }];
  return mappedFeatureFlags;
}

#pragma mark - Privacy Tracking

RCT_EXPORT_METHOD(setAdTrackingEnabled:(BOOL)adTrackingEnabled
                  googleAdvertisingId:(NSString *)googleAdvertisingId) {
  // Ignore `googleAdvertisingId` - relevant only for Android.
  if (adTrackingEnabled) {
    RCTLogInfo(@"Ad tracking enabled");
  } else {
    RCTLogInfo(@"Ad tracking disabled");
  }
  [braze setAdTrackingEnabled:adTrackingEnabled];
}

RCT_EXPORT_METHOD(setIdentifierForAdvertiser:(NSString *)identifierForAdvertiser) {
  RCTLogInfo(@"setIdentifierForAdvertiser called with value: %@", identifierForAdvertiser);
  [braze setIdentifierForAdvertiser:identifierForAdvertiser];
}

RCT_EXPORT_METHOD(setIdentifierForVendor:(NSString *)identifierForVendor) {
  RCTLogInfo(@"setIdentifierForVendor called with value: %@", identifierForVendor);
  [braze setIdentifierForVendor:identifierForVendor];
}

RCT_EXPORT_METHOD(updateTrackingPropertyAllowList:(NSDictionary *)allowList) {
  NSArray<NSString *> *adding = allowList[@"adding"];
  NSArray<NSString *> *removing = allowList[@"removing"];
  NSArray<NSString *> *addingCustomEvents = allowList[@"addingCustomEvents"];
  NSArray<NSString *> *removingCustomEvents = allowList[@"removingCustomEvents"];
  NSArray<NSString *> *addingCustomAttributes = allowList[@"addingCustomAttributes"];
  NSArray<NSString *> *removingCustomAttributes = allowList[@"removingCustomAttributes"];

  NSMutableSet<BRZTrackingProperty *> *addingSet = [NSMutableSet set];
  NSMutableSet<BRZTrackingProperty *> *removingSet = [NSMutableSet set];

  if (adding.count > 0) {
    for (NSString *propertyString in adding) {
      [addingSet addObject:convertTrackingProperty(propertyString)];
    }
  }
  if (removing.count > 0) {
    for (NSString *propertyString in removing) {
      [removingSet addObject:convertTrackingProperty(propertyString)];
    }
  }

  // Parse custom strings
  if (addingCustomEvents.count > 0) {
    NSSet<NSString *> *customEvents = [NSSet setWithArray:addingCustomEvents];
    [addingSet addObject:[BRZTrackingProperty customEventWithEvents:customEvents]];
  }
  if (removingCustomEvents.count > 0) {
    NSSet<NSString *> *customEvents = [NSSet setWithArray:removingCustomEvents];
    [removingSet addObject:[BRZTrackingProperty customAttributeWithAttributes:customEvents]];
  }
  if (addingCustomAttributes.count > 0) {
    NSSet<NSString *> *customAttributes = [NSSet setWithArray:addingCustomAttributes];
    [addingSet addObject:[BRZTrackingProperty customAttributeWithAttributes:customAttributes]];
  }
  if (removingCustomAttributes.count > 0) {
    NSSet<NSString *> *customAttributes = [NSSet setWithArray:removingCustomAttributes];
    [removingSet addObject:[BRZTrackingProperty customAttributeWithAttributes:customAttributes]];
  }

  RCTLogInfo(@"Updating tracking allow list by adding: %@, removing %@", addingSet, removingSet);
  [braze updateTrackingAllowListAdding:addingSet removing:removingSet];
}

static BRZTrackingProperty *convertTrackingProperty(NSString *propertyString) {
  if ([propertyString isEqualToString:@"all_custom_attributes"]) {
    return BRZTrackingProperty.allCustomAttributes;
  } else if ([propertyString isEqualToString:@"all_custom_events"]) {
    return BRZTrackingProperty.allCustomEvents;
  } else if ([propertyString isEqualToString:@"analytics_events"]) {
    return BRZTrackingProperty.analyticsEvents;
  } else if ([propertyString isEqualToString:@"attribution_data"]) {
    return BRZTrackingProperty.attributionData;
  } else if ([propertyString isEqualToString:@"country"]) {
    return BRZTrackingProperty.country;
  } else if ([propertyString isEqualToString:@"dob"]) {
    return BRZTrackingProperty.dateOfBirth;
  } else if ([propertyString isEqualToString:@"device_data"]) {
    return BRZTrackingProperty.deviceData;
  } else if ([propertyString isEqualToString:@"email"]) {
    return BRZTrackingProperty.email;
  } else if ([propertyString isEqualToString:@"email_subscription_state"]) {
    return BRZTrackingProperty.emailSubscriptionState;
  } else if ([propertyString isEqualToString:@"everything"]) {
    return BRZTrackingProperty.everything;
  } else if ([propertyString isEqualToString:@"first_name"]) {
    return BRZTrackingProperty.firstName;
  } else if ([propertyString isEqualToString:@"gender"]) {
    return BRZTrackingProperty.gender;
  } else if ([propertyString isEqualToString:@"home_city"]) {
    return BRZTrackingProperty.homeCity;
  } else if ([propertyString isEqualToString:@"language"]) {
    return BRZTrackingProperty.language;
  } else if ([propertyString isEqualToString:@"last_name"]) {
    return BRZTrackingProperty.lastName;
  } else if ([propertyString isEqualToString:@"notification_subscription_state"]) {
    return BRZTrackingProperty.notificationSubscriptionState;
  } else if ([propertyString isEqualToString:@"phone_number"]) {
    return BRZTrackingProperty.phoneNumber;
  } else if ([propertyString isEqualToString:@"push_token"]) {
    return BRZTrackingProperty.pushToken;
  } else {
    RCTLogInfo(@"Invalid tracking property: %@", propertyString);
    return nil;
  }
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeBrazeReactModuleSpecJSI>(params);
}
#endif

@end
