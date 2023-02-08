#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface BrazeReactUtils : NSObject

+ (BrazeReactUtils *)sharedInstance;
- (BOOL)populateInitialUrlFromLaunchOptions:(NSDictionary *)launchOptions;
- (BOOL)populateInitialUrlForCategories:(NSDictionary *)userInfo;

@property NSString *initialUrlString;

@end
