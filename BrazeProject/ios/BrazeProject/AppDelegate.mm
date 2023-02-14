#import "AppDelegate.h"
#import <React/RCTLinkingManager.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import "BrazeReactUtils.h"
#import "BrazeReactBridge.h"

#import <BrazeKit/BrazeKit-Swift.h>

@implementation AppDelegate

@synthesize bridge;

static Braze *_braze;

static NSString *const apiKey = @"b7271277-0fec-4187-beeb-3ae6e6fbed11";
static NSString *const endpoint = @"sondheim.braze.com";

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"BrazeProject";
  self.initialProps = @{};

  // Setup Braze bridge
  id<RCTBridgeDelegate> moduleInitializer = [[BrazeReactBridge alloc] init];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:moduleInitializer
                                            launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"BrazeProject"
                                            initialProperties:nil];
  self.bridge = rootView.bridge;

  // Configure views in the application
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  // Setup Braze
  BRZConfiguration *configuration = [[BRZConfiguration alloc] initWithApiKey:apiKey endpoint:endpoint];
  configuration.triggerMinimumTimeInterval = 1;
  configuration.logger.level = BRZLoggerLevelInfo;
  Braze *braze = [BrazeReactBridge initBraze:configuration];
  AppDelegate.braze = braze;

  [self registerForPushNotifications];
  [[BrazeReactUtils sharedInstance] populateInitialUrlFromLaunchOptions:launchOptions];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

#pragma mark - Push Notifications

- (void)registerForPushNotifications {
  if (floor(NSFoundationVersionNumber) > NSFoundationVersionNumber_iOS_9_x_Max) {
    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    if (@available(iOS 12.0, *)) {
      [center setNotificationCategories:BRZNotifications.categories];
      [[UIApplication sharedApplication] registerForRemoteNotifications];
      // authorization is requested later in the Javascript layer
    } else {
      UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:(UIUserNotificationTypeBadge | UIUserNotificationTypeAlert | UIUserNotificationTypeSound) categories:nil];
      [[UIApplication sharedApplication] registerForRemoteNotifications];
      [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    }
  }
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  (void)[AppDelegate.braze.notifications handleBackgroundNotificationWithUserInfo:userInfo
                                                           fetchCompletionHandler:completionHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
  didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {
  [[BrazeReactUtils sharedInstance] populateInitialUrlForCategories:response.notification.request.content.userInfo];
  (void)[AppDelegate.braze.notifications handleUserNotificationWithResponse:response
                                                      withCompletionHandler:completionHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
  if (@available(iOS 14.0, *)) {
    completionHandler(UNNotificationPresentationOptionList | UNNotificationPresentationOptionBanner);
  } else {
    completionHandler(UNNotificationPresentationOptionAlert);
  }
}

- (void)application:(UIApplication *)application
  didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [AppDelegate.braze.notifications registerDeviceToken:deviceToken];
}

#pragma mark - Linking

// Deep Linking
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  NSLog(@"Calling RCTLinkingManager with url %@", url);
  return [RCTLinkingManager application:application openURL:url options:options];
}

// Universal links
- (BOOL)application:(UIApplication *)application
  continueUserActivity:(NSUserActivity *)userActivity
  restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> *restorableObjects))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

#pragma mark - Helpers

+ (Braze *)braze {
  return _braze;
}

+ (void)setBraze:(Braze *)braze {
  _braze = braze;
}

#pragma mark - React Native methods

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return false;
}

@end
