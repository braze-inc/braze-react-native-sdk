#import <RCTAppDelegate.h>
#import <React/RCTBridge.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) RCTBridge* bridge;

@end
