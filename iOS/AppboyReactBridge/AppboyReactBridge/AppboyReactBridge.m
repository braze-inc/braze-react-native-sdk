#import "AppboyReactBridge.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import "AppboyKit.h"
#import "ABKUser.h"
#import "AppboyReactUtils.h"
#import "ABKModalFeedbackViewController.h"
#import "ABKNewsFeedViewController.h"

@implementation RCTConvert (AppboySubscriptionType)
RCT_ENUM_CONVERTER(ABKNotificationSubscriptionType,
                   (@{@"subscribed":@(ABKSubscribed), @"unsubscribed":@(ABKUnsubscribed),@"optedin":@(ABKOptedIn)}),
                   ABKSubscribed,
                   integerValue);
@end

@interface AppboyReactBridge ()
@property (nonatomic, retain) NSArray *loadedCards;
@end

@implementation AppboyReactBridge
{
    BOOL hasListeners;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (NSDictionary *)constantsToExport
{
  return @{@"subscribed":@(ABKSubscribed), @"unsubscribed":@(ABKUnsubscribed),@"optedin":@(ABKOptedIn)};
};

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"FeedUpdated"];
}

- (void)startObserving {
    hasListeners = YES;
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(feedUpdated:) name:ABKFeedUpdatedNotification object:nil];
}

- (void)stopObserving {
    hasListeners = NO;
    [[NSNotificationCenter defaultCenter] removeObserver:self name:ABKFeedUpdatedNotification object:nil];
}

- (void)reportResultWithCallback:(RCTResponseSenderBlock)callback andError:(NSString *)error andResult:(id)result {
  if (callback != nil) {
    if (error != nil) {
      callback(@[error, [NSNull null]]);
    } else {
      callback(@[[NSNull null], result]);
    }
  } else {
    RCTLogInfo(@"Warning: AppboyReactBridge callback was null.");
  }
}

RCT_EXPORT_METHOD(setSDKFlavor) {
  [Appboy sharedInstance].sdkFlavor = REACT;
}

// Returns the deep link from the push dictionary in application:didFinishLaunchingWithOptions: launchOptions, if one exists
// For more context see getInitialURL() in index.js
RCT_EXPORT_METHOD(getInitialUrl:(RCTResponseSenderBlock)callback) {
  if ([AppboyReactUtils sharedInstance].initialUrlString != nil) {
    [self reportResultWithCallback:callback andError:nil andResult:[AppboyReactUtils sharedInstance].initialUrlString];
  } else {
    [self reportResultWithCallback:callback andError:@"Initial URL string was nil." andResult:nil];
  }
}

RCT_EXPORT_METHOD(changeUser:(NSString *)userId)
{
  RCTLogInfo(@"[Appboy sharedInstance] changeUser with value %@", userId);
  [[Appboy sharedInstance] changeUser:userId];
}

RCT_EXPORT_METHOD(registerPushToken:(NSString *)token)
{
  RCTLogInfo(@"[Appboy sharedInstance] registerPushToken with value %@", token);
  [[Appboy sharedInstance] registerPushToken:token];
}

RCT_EXPORT_METHOD(submitFeedback:(NSString *)replyToEmail message:(NSString *)message isReportingABug:(BOOL)isReportingABug callback:(RCTResponseSenderBlock)callback)
{
  RCTLogInfo(@"[Appboy sharedInstance] submitFeedback with values %@ %@ %@", replyToEmail, message, isReportingABug ? @"true" : @"false");
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance] submitFeedback:replyToEmail message:message isReportingABug:isReportingABug])];
}

RCT_EXPORT_METHOD(logCustomEvent:(NSString *)eventName withProperties:(nullable NSDictionary *)properties) {
  RCTLogInfo(@"[Appboy sharedInstance] logCustomEvent with eventName %@", eventName);
  [[Appboy sharedInstance] logCustomEvent:eventName withProperties:properties];
}

RCT_EXPORT_METHOD(logPurchase:(NSString *)productIdentifier atPrice:(NSString *)price inCurrency:(NSString *)currencyCode withQuantity:(NSUInteger)quantity andProperties:(nullable NSDictionary *)properties) {
  RCTLogInfo(@"[Appboy sharedInstance] logPurchase with productIdentifier %@", productIdentifier);
  NSDecimalNumber *decimalPrice = [NSDecimalNumber decimalNumberWithString:price];
  [[Appboy sharedInstance] logPurchase:productIdentifier inCurrency:currencyCode atPrice:decimalPrice withQuantity:quantity andProperties:properties];
}

RCT_EXPORT_METHOD(setFirstName:(NSString *)firstName) {
  RCTLogInfo(@"[Appboy sharedInstance].user.firstName =  %@", firstName);
  [Appboy sharedInstance].user.firstName = firstName;
}

RCT_EXPORT_METHOD(setLastName:(NSString *)lastName) {
  RCTLogInfo(@"[Appboy sharedInstance].user.lastName =  %@", lastName);
  [Appboy sharedInstance].user.lastName = lastName;
}

RCT_EXPORT_METHOD(setEmail:(NSString *)email) {
  RCTLogInfo(@"[Appboy sharedInstance].user.email =  %@", email);
  [Appboy sharedInstance].user.email = email;
}

RCT_EXPORT_METHOD(setDateOfBirth:(int)year month:(int)month day:(int)day) {
  RCTLogInfo(@"[Appboy sharedInstance].user.dateOfBirth =  %@", @"date");
  NSCalendar *calendar = [NSCalendar currentCalendar];
  NSDateComponents *components = [[NSDateComponents alloc] init];
  [components setDay:day];
  [components setMonth:month];
  [components setYear:year];
  NSDate *dateOfBirth = [calendar dateFromComponents:components];
  [Appboy sharedInstance].user.dateOfBirth = dateOfBirth;
}

RCT_EXPORT_METHOD(setCountry:(NSString *)country) {
  RCTLogInfo(@"[Appboy sharedInstance].user.country =  %@", country);
  [Appboy sharedInstance].user.country = country;
}

RCT_EXPORT_METHOD(setHomeCity:(NSString *)homeCity) {
  RCTLogInfo(@"[Appboy sharedInstance].user.homeCity =  %@", homeCity);
  [Appboy sharedInstance].user.homeCity = homeCity;
}

RCT_EXPORT_METHOD(setGender:(NSString *)gender callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].gender =  %@", gender);
  if ([[gender capitalizedString] hasPrefix:@"F"]) {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setGender:ABKUserGenderFemale])];
  } else if ([[gender capitalizedString] hasPrefix:@"M"]) {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setGender:ABKUserGenderMale])];
  } else if ([[gender capitalizedString] hasPrefix:@"N"]) {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setGender:ABKUserGenderNotApplicable])];
  } else if ([[gender capitalizedString] hasPrefix:@"O"]) {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setGender:ABKUserGenderOther])];
  } else if ([[gender capitalizedString] hasPrefix:@"P"]) {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setGender:ABKUserGenderPreferNotToSay])];
  } else if ([[gender capitalizedString] hasPrefix:@"U"]) {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setGender:ABKUserGenderUnknown])];
  } else {
    [self reportResultWithCallback:callback andError:[NSString stringWithFormat:@"Invalid input %@. Gender not set.", gender] andResult:nil];
  }
}

RCT_EXPORT_METHOD(setPhoneNumber:(NSString *)phone) {
  RCTLogInfo(@"[Appboy sharedInstance].user.phone =  %@", phone);
  [Appboy sharedInstance].user.phone = phone;
}

RCT_EXPORT_METHOD(setAvatarImageUrl:(NSString *)avatarImageURL) {
  RCTLogInfo(@"[Appboy sharedInstance].user.avatarImageURL =  %@", avatarImageURL);
  [Appboy sharedInstance].user.avatarImageURL = avatarImageURL;
}

RCT_EXPORT_METHOD(setEmailNotificationSubscriptionType:(ABKNotificationSubscriptionType)emailNotificationSubscriptionType callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user.emailNotificationSubscriptionType =  %@", @"enum");
  [self reportResultWithCallback:callback andError:nil andResult:@([Appboy sharedInstance].user.emailNotificationSubscriptionType = emailNotificationSubscriptionType)];
}

RCT_EXPORT_METHOD(setPushNotificationSubscriptionType:(ABKNotificationSubscriptionType)pushNotificationSubscriptionType callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].pushNotificationSubscriptionType =  %@", @"enum");
  [self reportResultWithCallback:callback andError:nil andResult:@([Appboy sharedInstance].user.pushNotificationSubscriptionType = pushNotificationSubscriptionType)];
}

RCT_EXPORT_METHOD(setBoolCustomUserAttribute:(NSString *)key andValue:(BOOL)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndBoolValue: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setCustomAttributeWithKey:key andBOOLValue:value])];
}

RCT_EXPORT_METHOD(setStringCustomUserAttribute:(NSString *)key andValue:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndStringValue: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setCustomAttributeWithKey:key andStringValue:value])];
}

RCT_EXPORT_METHOD(setDoubleCustomUserAttribute:(NSString *)key andValue:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndDoubleValue: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setCustomAttributeWithKey:key andDoubleValue:value])];
}

RCT_EXPORT_METHOD(setDateCustomUserAttribute:(NSString *)key andValue:(double)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndDateValue: =  %@", key);
  NSDate *date = [NSDate dateWithTimeIntervalSince1970:value];
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setCustomAttributeWithKey:key andDateValue:date])];
}

RCT_EXPORT_METHOD(setIntCustomUserAttribute:(NSString *)key andValue:(int)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndIntValue: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setCustomAttributeWithKey:key andIntegerValue:value])];
}

RCT_EXPORT_METHOD(setCustomUserAttributeArray:(NSString *)key andValue:(NSArray *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeArrayWithKey:array:: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user setCustomAttributeArrayWithKey:key array:value])];
}

RCT_EXPORT_METHOD(unsetCustomUserAttribute:(NSString *)key callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user unsetCustomUserAttribute: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user unsetCustomAttributeWithKey:key])];
}

RCT_EXPORT_METHOD(incrementCustomUserAttribute:(NSString *)key by:(NSInteger)incrementValue callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user incrementCustomUserAttribute: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user incrementCustomUserAttribute:key by:incrementValue])];
}

RCT_EXPORT_METHOD(addToCustomAttributeArray:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user addToCustomAttributeArray: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user addToCustomAttributeArrayWithKey:key value:value])];
}

RCT_EXPORT_METHOD(removeFromCustomAttributeArray:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"[Appboy sharedInstance].user removeFromCustomAttributeArrayWithKey: =  %@", key);
  [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].user removeFromCustomAttributeArrayWithKey:key value:value])];
}

RCT_EXPORT_METHOD(setTwitterData:(NSUInteger)twitterId withScreenName:(NSString *)screenName withName:(NSString *)name withDescription:(NSString *)description withFollowersCount:(NSUInteger)followersCount withFriendsCount:(NSUInteger)friendsCount withStatusesCount:(NSUInteger)statusesCount andProfileImageUrl:(NSString *)profileImageUrl) {
    RCTLogInfo(@"[Appboy sharedInstance].user setTwitterData with screenName %@", screenName);
    ABKTwitterUser *twitterUser = [[ABKTwitterUser alloc] init];
    twitterUser.userDescription = description;
    twitterUser.twitterID = twitterId;
    twitterUser.twitterName = name;
    twitterUser.profileImageUrl = profileImageUrl;
    twitterUser.friendsCount = friendsCount;
    twitterUser.followersCount = followersCount;
    twitterUser.screenName = screenName;
    twitterUser.statusesCount = statusesCount;
    [Appboy sharedInstance].user.twitterUser = twitterUser;
}

RCT_EXPORT_METHOD(setFacebookData:(nullable NSDictionary *)facebookUserDictionary withNumberOfFriends:(NSUInteger)numberOfFriends withLikes:(NSArray *)likes) {
    RCTLogInfo(@"[Appboy sharedInstance].user setFacebookData");
    ABKFacebookUser *facebookUser = [[ABKFacebookUser alloc] initWithFacebookUserDictionary:facebookUserDictionary
                                                                            numberOfFriends:numberOfFriends
                                                                                      likes:likes];
    [Appboy sharedInstance].user.facebookUser = facebookUser;
}

RCT_EXPORT_METHOD(launchNewsFeed) {
  RCTLogInfo(@"launchNewsFeed called");
  ABKNewsFeedViewController *feedModal = [[ABKNewsFeedViewController alloc] init];
  feedModal.navigationItem.title = @"News";
  UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
  UIViewController *mainViewController = keyWindow.rootViewController;
  [mainViewController presentViewController:feedModal animated:YES completion:nil];
}

- (ABKCardCategory)getCardCategoryForString:(NSString *)category {
  ABKCardCategory cardCategory = 0;
  if ([[category lowercaseString] isEqualToString:@"advertising"]) {
    cardCategory = ABKCardCategoryAdvertising;
  } else if ([[category lowercaseString] isEqualToString:@"announcements"]) {
    cardCategory = ABKCardCategoryAnnouncements;
  } else if ([[category lowercaseString] isEqualToString:@"news"]) {
    cardCategory = ABKCardCategoryNews;
  } else if ([[category lowercaseString] isEqualToString:@"social"]) {
    cardCategory = ABKCardCategorySocial;
  } else if ([[category lowercaseString] isEqualToString:@"no_category"]) {
    cardCategory = ABKCardCategoryNoCategory;
  } else if ([[category lowercaseString] isEqualToString:@"all"]) {
    cardCategory = ABKCardCategoryAll;
  }
  return cardCategory;
}

RCT_EXPORT_METHOD(requestFeedRefresh) {
  [[Appboy sharedInstance] requestFeedRefresh];
}

- (void)feedUpdated:(NSNotification *)notification {
    BOOL updateIsSuccessful = [notification.userInfo[ABKFeedUpdatedIsSuccessfulKey] boolValue];
    if (hasListeners) {
        [self sendEventWithName:@"FeedUpdated" body:@{@"updateSuccessful": @(updateIsSuccessful)}];
    }
}

RCT_EXPORT_METHOD(wipeData) {
  [Appboy wipeDataAndDisableForAppRun];
}

RCT_EXPORT_METHOD(disableSDK) {
  [Appboy disableSDK];
}

RCT_EXPORT_METHOD(enableSDK) {
  [Appboy requestEnableSDKOnNextAppRun];
}

RCT_EXPORT_METHOD(requestLocationInitialization) {
  RCTLogInfo(@"Warning: This is an Android only feature.");
}

RCT_EXPORT_METHOD(getCardCountForCategories:(NSString *)category callback:(RCTResponseSenderBlock)callback) {
  ABKCardCategory cardCategory = [self getCardCategoryForString:category];
  if (cardCategory == 0) {
    [self reportResultWithCallback:callback andError:[NSString stringWithFormat:@"Invalid card category %@, could not retrieve card count.", category] andResult:nil];
  } else {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].feedController cardCountForCategories:cardCategory])];
  }
}

RCT_EXPORT_METHOD(getUnreadCardCountForCategories:(NSString *)category callback:(RCTResponseSenderBlock)callback) {
  ABKCardCategory cardCategory = [self getCardCategoryForString:category];
  if (cardCategory == 0) {
    [self reportResultWithCallback:callback andError:[NSString stringWithFormat:@"Invalid card category %@, could not retrieve unread card count.", category] andResult:nil];
  } else {
    [self reportResultWithCallback:callback andError:nil andResult:@([[Appboy sharedInstance].feedController unreadCardCountForCategories:cardCategory])];
  }
}

RCT_EXPORT_METHOD(getCardsInCategories:(NSString *)category callback:(RCTResponseSenderBlock)callback) {
    ABKCardCategory cardCategory = [self getCardCategoryForString:category];
    if (cardCategory == 0) {
        [self reportResultWithCallback:callback andError:[NSString stringWithFormat:@"Invalid card category %@, could not retrieve cards.", category] andResult:nil];
    } else {
        NSArray *cards = [[Appboy sharedInstance].feedController getCardsInCategories:cardCategory];
        self.loadedCards = [NSArray arrayWithArray: cards];
        NSMutableArray *translated = [NSMutableArray arrayWithCapacity: [cards count]];
        NSError *error;
        for (ABKCard *card in cards) {
            NSDictionary *mappedCard = [NSJSONSerialization JSONObjectWithData: [card serializeToData] options: 0 error: &error];
            [translated addObject: mappedCard];
        }
        NSString *errorText = nil;
        if (error != nil) {
            errorText = [error description];
        }
        [self reportResultWithCallback:callback andError:errorText andResult:translated];
    }
}

- (void)findCardWithId:(NSString *)cardId andInvoke:(SEL) selector withCallback:(RCTResponseSenderBlock)callback {
    if (self.loadedCards == nil) {
        [self reportResultWithCallback: callback andError:@"No cards have been loaded" andResult:nil];
    } else {
        NSUInteger foundIndex = [self.loadedCards indexOfObjectPassingTest: ^ (ABKCard *card, NSUInteger idx, BOOL *stop) {
            return [cardId isEqualToString: card.idString];
        }];
        if (foundIndex == NSNotFound) {
            [self reportResultWithCallback: callback andError:[NSString stringWithFormat:@"No card found with ID %@", cardId] andResult:nil];
        } else {
            ABKCard *card = self.loadedCards[foundIndex];
            // Explicitly mark selector as void for ARC
            IMP imp = [card methodForSelector: selector];
            void (*func)(id, SEL) = (void *)imp;
            func(card, selector);
            [self reportResultWithCallback:callback andError:nil andResult:cardId];
        }
    }
}

RCT_EXPORT_METHOD(logCardImpression:(NSString *)cardId callback:(RCTResponseSenderBlock)callback) {
    [self findCardWithId:cardId andInvoke:@selector(logCardImpression) withCallback:callback];
}

RCT_EXPORT_METHOD(logCardClicked:(NSString *)cardId callback:(RCTResponseSenderBlock)callback) {
    [self findCardWithId:cardId andInvoke:@selector(logCardClicked) withCallback:callback];
}

RCT_EXPORT_METHOD(launchFeedback) {
  RCTLogInfo(@"launchFeedback called");
  ABKModalFeedbackViewController *feedbackModal = [[ABKModalFeedbackViewController alloc] init];
  UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
  UIViewController *mainViewController = keyWindow.rootViewController;
  [mainViewController presentViewController:feedbackModal animated:YES completion:nil];
}

RCT_EXPORT_METHOD(requestImmediateDataFlush) {
  RCTLogInfo(@"requestImmediateDataFlush called");
  [[Appboy sharedInstance] flushDataAndProcessRequestQueue];
}

RCT_EXPORT_MODULE();
@end
