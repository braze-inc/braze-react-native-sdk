#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface AppboyReactUtils : NSObject

+ (AppboyReactUtils *)sharedInstance;
- (BOOL)populateInitialUrlFromLaunchOptions:(NSDictionary *)launchOptions;

@property NSString *initialUrlString;

@end
