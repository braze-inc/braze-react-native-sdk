#import "BrazeReactBridge.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import <React/RCTBundleURLProvider.h>
#import <UserNotifications/UserNotifications.h>

#import "BrazeReactUtils.h"

@import BrazeUI;
@import BrazeLocation;

static NSString *const kContentCardsUpdatedEvent = @"contentCardsUpdated";
static NSString *const kNewsFeedCardsUpdatedEvent = @"newsFeedCardsUpdated";
static NSString *const kSdkAuthenticationErrorEvent = @"sdkAuthenticationError";
static NSString *const kInAppMessageReceivedEvent = @"inAppMessageReceived";
static NSString *const kPushNotificationEvent = @"pushNotificationEvent";

@implementation RCTConvert (BrazeSubscriptionType)
RCT_ENUM_CONVERTER(BRZUserSubscriptionState,
                   (@{
                      @"subscribed":@(BRZUserSubscriptionStateSubscribed),
                      @"unsubscribed":@(BRZUserSubscriptionStateUnsubscribed),
                      @"optedin":@(BRZUserSubscriptionStateOptedIn)
                   }),
                   BRZUserSubscriptionStateSubscribed,
                   integerValue);
@end

@interface BrazeReactBridge () <BrazeDelegate, BrazeInAppMessageUIDelegate>

@property (strong, nonatomic) BRZCancellable *contentCardsSubscription;
@property (strong, nonatomic) BRZCancellable *newsFeedSubscription;

@end

static Braze *braze;

@implementation BrazeReactBridge {
    bool hasListeners;
    bool useBrazeUIForInAppMessages;
}

#pragma mark - Setup

+ (Braze *)initBraze:(BRZConfiguration *)configuration {
  [configuration.api addSDKMetadata:@[BRZSDKMetadata.reactnative]];
  configuration.api.sdkFlavor = BRZSDKFlavorReact;
  Braze *instance = [[Braze alloc] initWithConfiguration:configuration];
  braze = instance;
  return instance;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (void)startObserving {
  hasListeners = YES;
  braze.delegate = self;

  self.contentCardsSubscription = [braze.contentCards subscribeToUpdates:^(NSArray<BRZContentCardRaw *> * _Nonnull cards) {
    RCTLogInfo(@"Received Content Cards array via subscription of length: %lu", [cards count]);
    NSMutableDictionary *eventData = [NSMutableDictionary dictionary];
    eventData[@"cards"] = RCTFormatContentCards(cards);
    [self sendEventWithName:kContentCardsUpdatedEvent body:eventData];
  }];
  self.newsFeedSubscription = [braze.newsFeed subscribeToUpdates:^(NSArray<BRZNewsFeedCard *> * _Nonnull cards) {
    RCTLogInfo(@"Received News Feed cards via subscription of length: %lu", [cards count]);
    [self sendEventWithName:kNewsFeedCardsUpdatedEvent body:nil];
  }];

  // Add default in-app message UI
  BrazeInAppMessageUI *inAppMessageUI = [[BrazeInAppMessageUI alloc] init];
  braze.inAppMessagePresenter = inAppMessageUI;
}

- (void)stopObserving {
  hasListeners = NO;
  braze.delegate = nil;
  ((BrazeInAppMessageUI *)braze.inAppMessagePresenter).delegate = nil;
  self.contentCardsSubscription = nil;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    kContentCardsUpdatedEvent,
    kNewsFeedCardsUpdatedEvent,
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

RCT_EXPORT_METHOD(setSDKFlavor) {
  RCTLogInfo(@"No-op on iOS. SDK flavor must be set using the 'Braze.Configuration' object at SDK initialization.");
}

RCT_EXPORT_METHOD(setMetadata) {
  RCTLogInfo(@"No-op on iOS. SDK metadata must be set using the 'Braze.Configuration' object at SDK initialization.");
}

// Returns push deep links from cold app starts.
// For more context see getInitialURL() in index.js
RCT_EXPORT_METHOD(getInitialUrl:(RCTResponseSenderBlock)callback) {
  if ([BrazeReactUtils sharedInstance].initialUrlString != nil) {
    [self reportResultWithCallback:callback andError:nil andResult:[BrazeReactUtils sharedInstance].initialUrlString];
  } else {
    [self reportResultWithCallback:callback andError:nil andResult:nil];
  }
}

RCT_EXPORT_METHOD(getInstallTrackingId:(RCTResponseSenderBlock)callback) {
  [braze deviceIdWithCompletion:^(NSString *deviceId) {
    [self reportResultWithCallback:callback andError:nil andResult:deviceId];
  }];
}

RCT_EXPORT_METHOD(changeUser:(NSString *)userId sdkAuthSignature:(nullable NSString *)signature) {
  RCTLogInfo(@"braze changeUser with values %@ %@", userId, signature);
  [braze changeUser:userId sdkAuthSignature:signature];
}

RCT_EXPORT_METHOD(addAlias:(NSString *)aliasName withLabel:(NSString *)aliasLabel) {
  RCTLogInfo(@"braze.user addAlias with values %@ %@", aliasName, aliasLabel);
  [braze.user addAlias:aliasName label:aliasLabel];
}

RCT_EXPORT_METHOD(registerAndroidPushToken:(NSString *)token) {
  RCTLogInfo(@"Warning: This is an Android only feature.");
}

RCT_EXPORT_METHOD(setGoogleAdvertisingId:(NSString *)googleAdvertisingId andAdTrackingEnabled:(BOOL)adTrackingEnabled) {
  RCTLogInfo(@"Warning: This is an Android only feature.");
}

RCT_EXPORT_METHOD(logCustomEvent:(NSString *)eventName withProperties:(nullable NSDictionary *)properties) {
  RCTLogInfo(@"braze logCustomEvent with eventName %@", eventName);
  if (!properties) {
    [braze logCustomEvent:eventName];
    return;
  }
  [braze logCustomEvent:eventName properties:[self parseDictionary:properties]];
}

- (NSDictionary *)parseDictionary:(NSDictionary *)dictionary {
  NSArray *keys = [dictionary allKeys];
  NSMutableDictionary *parsedDictionary = [dictionary mutableCopy];
  for (NSString *key in keys) {
    if ([dictionary[key] isKindOfClass:[NSDictionary class]]){
      NSString* type = dictionary[key][@"type"];
      if ([type isEqualToString:@"UNIX_timestamp"]) {
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
      NSString* type = array[i][@"type"];
      if ([type isEqualToString:@"UNIX_timestamp"]) {
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

RCT_EXPORT_METHOD(logPurchase:(NSString *)productIdentifier atPrice:(NSString *)price inCurrency:(NSString *)currencyCode withQuantity:(NSUInteger)quantity andProperties:(nullable NSDictionary *)properties) {
  RCTLogInfo(@"braze logPurchase with productIdentifier %@", productIdentifier);
  double decimalPrice = [[NSDecimalNumber decimalNumberWithString:price] doubleValue];
  if (!properties) {
    [braze logPurchase:productIdentifier currency:currencyCode price:decimalPrice quantity:quantity];
    return;
  }

  [braze logPurchase:productIdentifier currency:currencyCode price:decimalPrice quantity:quantity properties:[self parseDictionary:properties]];
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

RCT_EXPORT_METHOD(setDateOfBirth:(int)year month:(int)month day:(int)day) {
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

RCT_EXPORT_METHOD(setEmailNotificationSubscriptionType:(BRZUserSubscriptionState)emailNotificationSubscriptionType callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user.emailNotificationSubscriptionType =  %@", @"enum");
  [braze.user setEmailSubscriptionState:emailNotificationSubscriptionType];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setPushNotificationSubscriptionType:(BRZUserSubscriptionState)pushNotificationSubscriptionType callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.pushNotificationSubscriptionType =  %@", @"enum");
  [braze.user setPushNotificationSubscriptionState:pushNotificationSubscriptionType];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setBoolCustomUserAttribute:(NSString *)key andValue:(BOOL)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndBoolValue: =  %@", key);
  [braze.user setCustomAttributeWithKey:key boolValue:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setStringCustomUserAttribute:(NSString *)key andValue:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndStringValue: =  %@", key);
  [braze.user setCustomAttributeWithKey:key stringValue:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setDoubleCustomUserAttribute:(NSString *)key andValue:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndDoubleValue: =  %@", key);
  [braze.user setCustomAttributeWithKey:key doubleValue:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setDateCustomUserAttribute:(NSString *)key andValue:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndDateValue: =  %@", key);
  NSDate *date = [NSDate dateWithTimeIntervalSince1970:value];
  [braze.user setCustomAttributeWithKey:key dateValue:date];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setIntCustomUserAttribute:(NSString *)key andValue:(int)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeWithKey:AndIntValue: =  %@", key);
  [braze.user setCustomAttributeWithKey:key intValue:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setCustomUserAttributeArray:(NSString *)key andValue:(NSArray *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user setCustomAttributeArrayWithKey:array:: =  %@", key);
  [braze.user setCustomAttributeArrayWithKey:key array:value];
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

RCT_EXPORT_METHOD(incrementCustomUserAttribute:(NSString *)key by:(NSInteger)incrementValue callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user incrementCustomUserAttribute: =  %@", key);
  [braze.user incrementCustomUserAttribute:key by:incrementValue];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(addToCustomAttributeArray:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user addToCustomAttributeArray: =  %@", key);
  [braze.user addToCustomAttributeArrayWithKey:key value:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(removeFromCustomAttributeArray:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"braze.user removeFromCustomAttributeArrayWithKey: =  %@", key);
  [braze.user removeFromCustomAttributeArrayWithKey:key value:value];
  [self reportResultWithCallback:callback
                        andError:nil
                       andResult:@(YES)];
}

RCT_EXPORT_METHOD(setAttributionData:(NSString *)network withCampaign:(NSString *)campaign withAdGroup:(NSString *)adGroup withCreative:(NSString *)creative) {
  RCTLogInfo(@"braze.user setAttributionData");
  BRZUserAttributionData *attributionData = [[BRZUserAttributionData alloc]
                                             initWithNetwork:network
                                             campaign:campaign
                                             adGroup:adGroup
                                             creative:creative];
  [braze.user setAttributionData:attributionData];
}

#pragma mark - News Feed

RCT_EXPORT_METHOD(launchNewsFeed) {
  RCTLogInfo(@"News Feed UI not supported on iOS");
}

RCT_EXPORT_METHOD(requestFeedRefresh) {
  [braze.newsFeed requestRefresh];
}

RCT_REMAP_METHOD(getNewsFeedCards, getNewsFeedCardsWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
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

RCT_EXPORT_METHOD(launchContentCards) {
  RCTLogInfo(@"launchContentCards called");
  BRZContentCardUIModalViewController *contentCardsModal = [[BRZContentCardUIModalViewController alloc] initWithBraze:braze];
  contentCardsModal.navigationItem.title = @"Content Cards";
  UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
  UIViewController *mainViewController = keyWindow.rootViewController;
  [mainViewController presentViewController:contentCardsModal animated:YES completion:nil];
}

RCT_REMAP_METHOD(getContentCards, getContentCardsWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
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
    case BRZContentCardRawTypeBanner:
      formattedContentCardData[@"image"] = RCTNullIfNil(card.image ? card.image.absoluteString : nil);
      formattedContentCardData[@"imageAspectRatio"] = @(card.imageAspectRatio);
      formattedContentCardData[@"type"] = @"Banner";
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

- (void)braze:(Braze * _Nonnull)braze
  sdkAuthenticationFailedWithError:(BRZSDKAuthenticationError * _Nonnull)error {
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

RCT_EXPORT_METHOD(subscribeToInAppMessage:(BOOL)useBrazeUI)
{
  useBrazeUIForInAppMessages = useBrazeUI;
  ((BrazeInAppMessageUI *)braze.inAppMessagePresenter).delegate = self;
}

/// `BrazeInAppMessageUIDelegate` method
- (enum BRZInAppMessageUIDisplayChoice)inAppMessage:(BrazeInAppMessageUI *)ui
                            displayChoiceForMessage:(BRZInAppMessageRaw *)message {
  NSData *inAppMessageData = [message json];
  NSString *inAppMessageString = [[NSString alloc] initWithData:inAppMessageData encoding:NSUTF8StringEncoding];
  NSDictionary *arguments = @{
    @"inAppMessage" : inAppMessageString
  };

  // Send to JavaScript
  [self sendEventWithName:kInAppMessageReceivedEvent body:arguments];

  if (useBrazeUIForInAppMessages) {
    return BRZInAppMessageUIDisplayChoiceNow;
  } else {
    return BRZInAppMessageUIDisplayChoiceDiscard;
  }
}

RCT_EXPORT_METHOD(hideCurrentInAppMessage) {
  RCTLogInfo(@"hideCurrentInAppMessage called");
  [(BrazeInAppMessageUI *)braze.inAppMessagePresenter dismiss];
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

RCT_EXPORT_METHOD(logInAppMessageButtonClicked:(NSString *)inAppMessageString  buttonId:(int)buttonId) {
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

RCT_EXPORT_MODULE();

@end
