import UIKit
import UserNotifications
import React
import BrazeKit
import BrazeUI
import braze_react_native_sdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  static let apiKey = "b7271277-0fec-4187-beeb-3ae6e6fbed11"
  static let endpoint = "sondheim.braze.com"
  static let iOSPushAutoEnabledKey = "iOSPushAutoEnabled"
  
  static var braze: Braze? = nil
  static var deviceToken: Data? = nil
  
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // MARK: - Braze Delayed Initialization Configuration
    // Default to automatically setting up push notifications
    var pushAutoEnabled = true
    if let key = UserDefaults.standard.object(
      forKey: AppDelegate.iOSPushAutoEnabledKey
    ) as? Bool {
      pushAutoEnabled = key
    }

    BrazeReactInitializer.configure { configuration in
      configuration.triggerMinimumTimeInterval = 1
      configuration.logger.level = .info
      configuration.push.appGroup = "group.com.braze.helloreact.PushStories"
      if pushAutoEnabled {
        print("iOS Push Automation enabled.")
        configuration.push.automation = true
      }
    } postInitialization: { braze in
      braze.delegate = self
      AppDelegate.braze = braze
      if let token = AppDelegate.deviceToken {
        braze.notifications.register(deviceToken: token)
      }
    }
    
    // Use SDWebImage as the GIF provider.
    // GIFs are non-animating by default until overridden with a provider.
    GIFViewProvider.shared = .sdWebImage
    
    if !pushAutoEnabled {
      // If you have explicitly disabled push automation, register for push manually.
      print("iOS push automation disabled. Registering for push notifications manually.")
      self.registerForPushNotifications()
    }
    
    return true
  }
}

// MARK: - Push Notifications (Manual Integration)

extension AppDelegate: UNUserNotificationCenterDelegate {
  
  func registerForPushNotifications() {
    let center = UNUserNotificationCenter.current()
    center.setNotificationCategories(Braze.Notifications.categories)
    center.delegate = self
    UIApplication.shared.registerForRemoteNotifications()
    // Authorization is requested later in the JavaScript layer via `Braze.requestPushPermission`.
  }
  
  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable : Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    if let braze = AppDelegate.braze {
      let processedByBraze = braze.notifications.handleBackgroundNotification(
        userInfo: userInfo,
        fetchCompletionHandler: completionHandler
      )
      if processedByBraze { return }
    }
      
    completionHandler(.noData)
  }
  
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    _ = BrazeReactUtils.sharedInstance().populateInitialUrl(
      forCategories: response.notification.request.content.userInfo
    )
    if let braze = AppDelegate.braze {
      let processedByBraze = braze.notifications.handleUserNotification(
        response: response,
        withCompletionHandler: completionHandler
      )
      if processedByBraze { return }
    }
    completionHandler()
  }
  
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    if #available(iOS 14.0, *) {
      completionHandler([.list, .banner])
    } else {
      completionHandler([.alert])
    }
  }
  
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    AppDelegate.deviceToken = deviceToken
    AppDelegate.braze?.notifications.register(deviceToken: deviceToken)
    let hexToken = deviceToken.map { String(format: "%02x", $0) }.joined()
    print("Updated push token: \(hexToken)")
  }
}

// MARK: - Deep Linking
  
extension AppDelegate: BrazeDelegate {
  
  /// This `BrazeDelegate` method determines whether to open a given URL as a Universal Link.
  ///
  /// Reference the `Braze.URLContext` object to get additional details about the URL payload.
  func braze(_ braze: Braze, shouldOpenURL context: Braze.URLContext) -> Bool {
    if let urlHost = context.url.host, urlHost == "braze.com" {
      let userActivity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
      userActivity.webpageURL = context.url
      
      guard let scene = UIApplication.shared.connectedScenes.first else {
        return true
      }

      RCTLinkingManager.scene(scene, continue: userActivity)
      return false
    }
    return true
  }
  
}
