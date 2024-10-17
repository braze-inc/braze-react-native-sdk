#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <BrazeKit/BrazeKit-Swift.h>

@interface BrazeReactUtils : NSObject

+ (BrazeReactUtils *)sharedInstance;

/**
 * If the push dictionary from application:didFinishLaunchingWithOptions:launchOptions has a Braze push, we store it in initialPushPayload.
 */
- (BOOL)populateInitialPayloadFromLaunchOptions:(NSDictionary *)launchOptions;

/**
 * (Deprecated) Use method `populateInitialPayloadFromLaunchOptions` instead.
 */
- (BOOL)populateInitialUrlFromLaunchOptions:(NSDictionary *)launchOptions __deprecated_msg("use populateInitialPayloadFromLaunchOptions instead.");

/**
 * (Deprecated) Use method `populateInitialPayloadFromLaunchOptions` instead.
 */
- (BOOL)populateInitialUrlForCategories:(NSDictionary *)userInfo __deprecated_msg("use populateInitialPayloadFromLaunchOptions instead.");

/**
 * Formats the push notification payload into a JavaScript-readable object.
 */
- (NSDictionary *)formatPushPayload:(BRZNotificationsPayload *)payload withLaunchOptions:(NSDictionary *)launchOptions;

/**
 * The Braze push from application:didFinishLaunchingWithOptions:launchOptions. If there is no Braze push, this will be nil.
 */
@property NSDictionary *initialPushPayload;

/**
 * (Deprecated) Use property `initialPushPayload` instead.
 */
@property NSString *initialUrlString;

@end
