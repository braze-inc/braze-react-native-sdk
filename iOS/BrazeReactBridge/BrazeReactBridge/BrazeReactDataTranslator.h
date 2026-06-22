#import <Foundation/Foundation.h>
#import <BrazeKit/BrazeKit-Swift.h>

NS_ASSUME_NONNULL_BEGIN

@interface BrazeReactDataTranslator : NSObject

/**
 * Formats the in-app message into a JavaScript-readable object.
 * @param message The raw in-app message object to format
 * @return A formatted dictionary, or nil if the message is invalid
 */
+ (nullable NSDictionary *)formatInAppMessage:(nullable BRZInAppMessageRaw *)message;

/**
 * Formats the push notification payload into a JavaScript-readable object.
 * @param payload The push notification payload to format
 * @param launchOptions Optional launch options containing push notification info
 * @return A formatted dictionary with payload_type, url, title, body, and other fields
 */
+ (NSDictionary *)formatPushPayload:(BRZNotificationsPayload *)payload
                     withLaunchOptions:(nullable NSDictionary *)launchOptions;

/**
 * Converts dictionary keys from snake_case to camelCase with optional special cases.
 * @param original The original dictionary with snake_case keys
 * @param keysToPreserve Optional array of keys that should not be converted
 * @param specialCases Optional dictionary mapping snake_case keys to custom camelCase values
 * @return A new dictionary with converted keys
 */
+ (NSDictionary *)formatToCamelCase:(NSDictionary *)original
                     keysToPreserve:(nullable NSArray<NSString *> *)keysToPreserve
                       specialCases:(nullable NSDictionary<NSString *, NSString *> *)specialCases;

@end

NS_ASSUME_NONNULL_END
