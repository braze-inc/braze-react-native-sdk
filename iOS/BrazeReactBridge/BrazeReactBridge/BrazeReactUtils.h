#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <BrazeKit/BrazeKit-Swift.h>

@interface BrazeReactUtils : NSObject

+ (BrazeReactUtils *)sharedInstance;

+ (Braze *)braze;
+ (void)setBraze:(Braze *)braze;

/**
 * This method should be called in the app delegate's `application:didFinishLaunchingWithOptions:` method.
 * If the push dictionary from `launchOptions` has a Braze push, we store it in `initialPushPayload`.
 *
 * @param launchOptions The launch options dictionary from application:didFinishLaunchingWithOptions:launchOptions.
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
 * This is a dictionary representation of the push notification opened by the user, which launched the application.
 */
@property NSDictionary *initialPushPayload;

/**
 * (Deprecated) Use property `initialPushPayload` instead.
 */
@property NSString *initialUrlString;

@end
