import UIKit
import UserNotifications
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import BrazeKit
import BrazeUI
import braze_react_native_sdk

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  
  static let apiKey = "b7271277-0fec-4187-beeb-3ae6e6fbed11"
  static let endpoint = "sondheim.braze.com"
  static let iOSPushAutoEnabledKey = "iOSPushAutoEnabled"
  
  static var braze: Braze? = nil
  
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
    
    reactNativeDelegate = delegate
    reactNativeFactory = factory
    
    // MARK: - Braze Initialization and Configuration
    let configuration = Braze.Configuration(apiKey: Self.apiKey,
                                            endpoint: Self.endpoint)
    configuration.triggerMinimumTimeInterval = 1
    configuration.logger.level = .info
    configuration.push.appGroup = "group.com.braze.helloreact.PushStories"
    
    // Default to automatically setting up push notifications
    var pushAutoEnabled = true
    if let key = UserDefaults.standard.object(
      forKey: AppDelegate.iOSPushAutoEnabledKey
    ) as? Bool {
      pushAutoEnabled = key
    }
    if pushAutoEnabled {
      print("iOS Push Auto enabled.")
      configuration.push.automation = true
    }

    let braze = BrazeReactBridge.perform(
      #selector(BrazeReactBridge.initBraze(_:)),
      with: configuration
    ).takeUnretainedValue() as! Braze
    braze.delegate = self
    AppDelegate.braze = braze
    
    // Use SDWebImage as the GIF provider.
    // GIFs are non-animating by default until overridden with a provider.
    GIFViewProvider.shared = .sdWebImage
    
    if !pushAutoEnabled {
      // If you have explicitly disabled push automation, register for push manually.
      print("iOS push automation disabled. Registering for push notifications manually.")
      self.registerForPushNotifications()
    }
    
    window = UIWindow(frame: UIScreen.main.bounds)
    
    factory.startReactNative(
      withModuleName: "BrazeProject",
      in: window,
      launchOptions: launchOptions
    )
    
    if let launchOptions {
      BrazeReactUtils.sharedInstance().populateInitialPayload(
        fromLaunchOptions: launchOptions
      )
    }
    
    return true
  }
}

// MARK: - Default React Native Setup

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
  
  override func bundleURL() -> URL? {
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
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
    AppDelegate.braze?.notifications.register(deviceToken: deviceToken)
  }
}

// MARK: - Deep Linking
  
extension AppDelegate: BrazeDelegate {
  
  /// Handles incoming URL clicks.
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    print("Calling RCTLinkingManager with URL \(url)")
    return RCTLinkingManager.application(app, open: url, options: options)
  }
  
  /// Handles incoming Universal Links.
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([any UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
  
  /// This `BrazeDelegate` method determines whether to open a given URL as a Universal Link.
  ///
  /// Reference the `Braze.URLContext` object to get additional details about the URL payload.
  func braze(_ braze: Braze, shouldOpenURL context: Braze.URLContext) -> Bool {
    if let urlHost = context.url.host, urlHost == "braze.com" {
      let userActivity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
      userActivity.webpageURL = context.url
      
      _ = UIApplication.shared.delegate?.application?(
        UIApplication.shared,
        continue: userActivity,
        restorationHandler: { _ in }
      )
      
      return false
    }
    return true
  }
  
}
