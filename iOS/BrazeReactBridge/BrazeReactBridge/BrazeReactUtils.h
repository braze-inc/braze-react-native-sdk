#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <BrazeKit/BrazeKit-Swift.h>

NS_ASSUME_NONNULL_BEGIN

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
- (BOOL)populateInitialPayloadFromLaunchOptions:(nullable NSDictionary *)launchOptions;

/**
 * (Deprecated) Use method `populateInitialPayloadFromLaunchOptions` instead.
 */
- (BOOL)populateInitialUrlFromLaunchOptions:(nullable NSDictionary *)launchOptions __deprecated_msg("use populateInitialPayloadFromLaunchOptions instead.");

/**
 * (Deprecated) Use method `populateInitialPayloadFromLaunchOptions` instead.
 */
- (BOOL)populateInitialUrlForCategories:(nullable NSDictionary *)userInfo __deprecated_msg("use populateInitialPayloadFromLaunchOptions instead.");

/**
 * The Braze push from application:didFinishLaunchingWithOptions:launchOptions. If there is no Braze push, this will be nil.
 * This is a dictionary representation of the push notification opened by the user, which launched the application.
 */
@property (nullable, nonatomic, strong) NSDictionary *initialPushPayload;

/**
 * (Deprecated) Use property `initialPushPayload` instead.
 */
@property (nullable, nonatomic, strong) NSString *initialUrlString;

@end

NS_ASSUME_NONNULL_END
