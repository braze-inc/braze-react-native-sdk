#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface AppboyReactUtils : NSObject

+ (AppboyReactUtils *)sharedInstance;
- (BOOL)populateInitialUrlFromLaunchOptions:(NSDictionary *)launchOptions;
- (BOOL)populateInitialUrlForCategories:(NSDictionary *)userInfo;

@property NSString *initialUrlString;

@end
