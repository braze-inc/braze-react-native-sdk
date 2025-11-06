#import <Foundation/Foundation.h>
#import <BrazeKit/BrazeKit-Swift.h>

NS_ASSUME_NONNULL_BEGIN

@interface BrazeReactDataTranslator : NSObject

/**
 * Formats the in-app message into a JavaScript-readable object.
 */
+ (NSDictionary *)formatInAppMessage:(BRZInAppMessageRaw *)message;

/**
 * Formats the push notification payload into a JavaScript-readable object.
 */
+ (NSDictionary *)formatPushPayload:(BRZNotificationsPayload *)payload withLaunchOptions:(nullable NSDictionary *)launchOptions;

/**
 * Converts dictionary keys from snake_case to camelCase with optional special cases.
 */
+ (NSDictionary *)formatToCamelCase:(NSDictionary *)original
                     keysToPreserve:(nullable NSArray<NSString *> *)keysToPreserve
                       specialCases:(nullable NSDictionary<NSString *, NSString *> *)specialCases;

@end

NS_ASSUME_NONNULL_END
