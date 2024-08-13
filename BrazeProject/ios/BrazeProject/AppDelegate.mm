#import "AppDelegate.h"
#import <React/RCTLinkingManager.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

#import "BrazeReactUtils.h"
#import "BrazeReactBridge.h"
#import "BrazeReactDelegate.h"

#import <BrazeKit/BrazeKit-Swift.h>

@implementation AppDelegate

static Braze *_braze;

static NSString *const apiKey = @"b7271277-0fec-4187-beeb-3ae6e6fbed11";
static NSString *const endpoint = @"sondheim.braze.com";

// User Defaults keys
static NSString *const iOSPushAutoEnabledKey = @"iOSPushAutoEnabled";

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"BrazeProject";
  self.initialProps = @{};

  // Setup Braze
  BRZConfiguration *configuration = [[BRZConfiguration alloc] initWithApiKey:apiKey endpoint:endpoint];
  configuration.triggerMinimumTimeInterval = 1;
  configuration.logger.level = BRZLoggerLevelInfo;
  configuration.push.appGroup = @"group.com.braze.helloreact.PushStories";

  // Default to automatically setting up push notifications
  BOOL pushAutoEnabled = YES;
  if ([[NSUserDefaults standardUserDefaults] objectForKey:iOSPushAutoEnabledKey]) {
    pushAutoEnabled = [[NSUserDefaults standardUserDefaults] boolForKey:iOSPushAutoEnabledKey];
  }
  if (pushAutoEnabled) {
    NSLog(@"iOS Push Auto enabled.");
    configuration.push.automation =
        [[BRZConfigurationPushAutomation alloc] initEnablingAllAutomations:YES];
  }

  Braze *braze = [BrazeReactBridge initBraze:configuration];
  braze.delegate = [[BrazeReactDelegate alloc] init];
  AppDelegate.braze = braze;

  if (!pushAutoEnabled) {
    // If the user explicitly disables Push Auto, register for push manually
    NSLog(@"iOS Push Auto disabled - Registering for push manually.");
    [self registerForPushNotifications];
  }

  [[BrazeReactUtils sharedInstance] populateInitialUrlFromLaunchOptions:launchOptions];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

#pragma mark - Push Notifications (manual integration)

- (void)registerForPushNotifications {
  UNUserNotificationCenter *center = UNUserNotificationCenter.currentNotificationCenter;
  [center setNotificationCategories:BRZNotifications.categories];
  center.delegate = self;
  [UIApplication.sharedApplication registerForRemoteNotifications];
  // Authorization is requested later in the JavaScript layer via `Braze.requestPushPermission`.
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  BOOL processedByBraze = AppDelegate.braze != nil && [AppDelegate.braze.notifications handleBackgroundNotificationWithUserInfo:userInfo
                                                                                                         fetchCompletionHandler:completionHandler];
  if (processedByBraze) {
    return;
  }

  completionHandler(UIBackgroundFetchResultNoData);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
  didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {
  [[BrazeReactUtils sharedInstance] populateInitialUrlForCategories:response.notification.request.content.userInfo];
  BOOL processedByBraze = AppDelegate.braze != nil && [AppDelegate.braze.notifications handleUserNotificationWithResponse:response
                                                                                                    withCompletionHandler:completionHandler];
  if (processedByBraze) {
    return;
  }

  completionHandler();
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
  return true;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self bundleURL];
}

- (NSURL *)bundleURL {
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
}

@end
