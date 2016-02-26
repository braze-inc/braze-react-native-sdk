#import "AppboyReactBridge.h"
#import "RCTLog.h"
#import "RCTConvert.h"
#import "AppboyKit.h"
#import "ABKUser.h"

@implementation RCTConvert (AppboySubscriptionType)
RCT_ENUM_CONVERTER(ABKNotificationSubscriptionType,
  (@{@"subscribed":@(ABKSubscribed), @"unsubscribed":@(ABKUnsubscribed),@"optedin":@(ABKOptedIn)}),
                   ABKSubscribed,
                   integerValue);
@end

@implementation AppboyReactBridge

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (NSDictionary *)constantsToExport
{
  return @{@"subscribed":@(ABKSubscribed), @"unsubscribed":@(ABKUnsubscribed),@"optedin":@(ABKOptedIn)};
};

RCT_EXPORT_METHOD(changeUser:(NSString *)userId)
{
  RCTLogInfo(@"[Appboy sharedInstance] changeUser with value %@", userId);
  [[Appboy sharedInstance] changeUser:userId];
}

RCT_EXPORT_METHOD(submitFeedback:(NSString *)replyToEmail message:(NSString *)message isReportingABug:(BOOL)isReportingABug)
{
  RCTLogInfo(@"[Appboy sharedInstance] submitFeedback with values %@ %@ %@", replyToEmail, message, isReportingABug ? @"true" : @"false");
  [[Appboy sharedInstance] submitFeedback:replyToEmail message:message isReportingABug:isReportingABug];
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

RCT_EXPORT_METHOD(setGender:(NSString *)gender) {
  RCTLogInfo(@"[Appboy sharedInstance].gender =  %@", gender);
  if ([[gender capitalizedString] hasPrefix:@"M"]) {
    [Appboy sharedInstance].user.gender = ABKUserGenderMale;
  } else {
    [Appboy sharedInstance].user.gender = ABKUserGenderFemale;
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

RCT_EXPORT_METHOD(setEmailNotificationSubscriptionType:(ABKNotificationSubscriptionType)emailNotificationSubscriptionType) {
  RCTLogInfo(@"[Appboy sharedInstance].user.emailNotificationSubscriptionType =  %@", @"enum");
  [Appboy sharedInstance].user.emailNotificationSubscriptionType = emailNotificationSubscriptionType;
}

RCT_EXPORT_METHOD(setPushNotificationSubscriptionType:(ABKNotificationSubscriptionType)pushNotificationSubscriptionType) {
  RCTLogInfo(@"[Appboy sharedInstance].pushNotificationSubscriptionType =  %@", @"enum");
  [Appboy sharedInstance].user.pushNotificationSubscriptionType = pushNotificationSubscriptionType;
}

RCT_EXPORT_METHOD(setBoolCustomUserAttribute:(NSString *)key andValue:(BOOL)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndBoolValue: =  %@", key);
  [[Appboy sharedInstance].user setCustomAttributeWithKey:key andBOOLValue:value];
}

RCT_EXPORT_METHOD(setStringCustomUserAttribute:(NSString *)key andValue:(NSString *)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndStringValue: =  %@", key);
  [[Appboy sharedInstance].user setCustomAttributeWithKey:key andStringValue:value];
}

RCT_EXPORT_METHOD(setDoubleCustomUserAttribute:(NSString *)key andValue:(double)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndDoubleValue: =  %@", key);
  [[Appboy sharedInstance].user setCustomAttributeWithKey:key andDoubleValue:value];
}

RCT_EXPORT_METHOD(setDateCustomUserAttribute:(NSString *)key andValue:(NSDate *)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndDateValue: =  %@", key);
  [[Appboy sharedInstance].user setCustomAttributeWithKey:key andDateValue:value];
}

RCT_EXPORT_METHOD(setIntCustomUserAttribute:(NSString *)key andValue:(int)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeWithKey:AndIntValue: =  %@", key);
  [[Appboy sharedInstance].user setCustomAttributeWithKey:key andIntegerValue:value];
}

RCT_EXPORT_METHOD(setCustomUserAttributeArray:(NSString *)key andValue:(NSArray *)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user setCustomAttributeArrayWithKey:array:: =  %@", key);
  [[Appboy sharedInstance].user setCustomAttributeArrayWithKey:key array:value];
}

RCT_EXPORT_METHOD(unsetCustomUserAttribute:(NSString *)key) {
  RCTLogInfo(@"[Appboy sharedInstance].user unsetCustomUserAttribute: =  %@", key);
  [[Appboy sharedInstance].user unsetCustomAttributeWithKey:key];
}

RCT_EXPORT_METHOD(incrementCustomUserAttribute:(NSString *)key by:(NSInteger)incrementValue) {
  RCTLogInfo(@"[Appboy sharedInstance].user incrementCustomUserAttribute: =  %@", key);
  [[Appboy sharedInstance].user incrementCustomUserAttribute:key by:incrementValue];
}
                  
RCT_EXPORT_METHOD(addToCustomAttributeArray:(NSString *)key value:(NSString *)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user addToCustomAttributeArray: =  %@", key);
  [[Appboy sharedInstance].user addToCustomAttributeArrayWithKey:key value:value];
}

RCT_EXPORT_METHOD(removeFromCustomAttributeArray:(NSString *)key value:(NSString *)value) {
  RCTLogInfo(@"[Appboy sharedInstance].user removeFromCustomAttributeArrayWithKey: =  %@", key);
  [[Appboy sharedInstance].user removeFromCustomAttributeArrayWithKey:key value:value];
}

RCT_EXPORT_METHOD(launchNewsFeed) {
  RCTLogInfo(@"launchNewsFeed called");
  ABKFeedViewControllerModalContext *feedModal = [[ABKFeedViewControllerModalContext alloc] init];
  feedModal.navigationItem.title = @"News";
  // TODO, revisit how to get view controller
  UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
  UIViewController *mainViewController = keyWindow.rootViewController;
  [mainViewController presentViewController:feedModal animated:YES completion:nil];
}

RCT_EXPORT_METHOD(launchFeedback) {
  RCTLogInfo(@"launchFeedback called");
  ABKFeedbackViewControllerModalContext *feedbackModal = [[ABKFeedbackViewControllerModalContext alloc] init];
  UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
  UIViewController *mainViewController = keyWindow.rootViewController;
  [mainViewController presentViewController:feedbackModal animated:YES completion:nil];
}

RCT_EXPORT_MODULE();
@end
