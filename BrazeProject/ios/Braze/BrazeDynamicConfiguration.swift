import Foundation
import BrazeLocation
import braze_react_native_sdk

class ApplicationBrazeDelegate: BrazeDelegate {
  func braze(_ braze: Braze, shouldOpenURL context: Braze.URLContext) -> Bool {
    if (!context.isUniversalLink) {
      return true
    }
    
    let userActivity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
    
    userActivity.webpageURL = context.url
    
    let isHandled = UIApplication.shared.delegate?.application?(UIApplication.shared, continue: userActivity, restorationHandler: { _ in }) ?? false
    
    return !isHandled
  }
}

struct ConfigData: Codable {
  var apiKey: String;
  var endpoint: String;
  var logLevel: UInt8;
  
  init(apiKey: String?, endpoint: String?, logLevel: UInt8?) throws {
    guard
      let apiKey = apiKey,
      let endpoint = endpoint,
      let logLevel = logLevel
    else {
      throw NSError(
        domain: "BrazeDynamicConfiguration",
        code: 0,
        userInfo: [NSLocalizedDescriptionKey: "Given config attributes are invalid"]
      )
    }
    
    self.apiKey = apiKey
    self.endpoint = endpoint
    self.logLevel = logLevel
  }
  
  init(fromDictionary dictionary: NSDictionary) throws {
    try self.init(
      apiKey: dictionary["apiKey"] as? String,
      endpoint: dictionary["endpoint"] as? String,
      logLevel: dictionary["logLevel"] as? UInt8
    )
  }
}

let SAVED_CONFIG_KEY = "braze_saved_config"

@objc
public class BrazeDynamicConfiguration: NSObject {
  @objc static var launchOptions: [AnyHashable : Any]?
  
  static var brazeInstance: Braze?;
  
  static func getSavedConfig() -> ConfigData? {
    if let savedConfig = UserDefaults.standard.data(forKey: SAVED_CONFIG_KEY) {
      do {
        return try JSONDecoder().decode(ConfigData.self, from: savedConfig)
      } catch {
        return nil
      }
    }
    
    return nil
  }
  
  static func saveConfig(fromDictionary dictionary: NSDictionary) throws {
    let configData = try ConfigData(fromDictionary: dictionary)
    let encodedConfig = try JSONEncoder().encode(configData)
    
    UserDefaults.standard.set(encodedConfig, forKey: SAVED_CONFIG_KEY)
  }
  
  static func initializeWithSavedConfig() async throws {
    if let configData = getSavedConfig() {
      await initialize(withConfigData: configData)
    } else {
      throw NSError(
        domain: "BrazeDynamicConfiguration",
        code: 0,
        userInfo: [NSLocalizedDescriptionKey: "No saved config"]
      )
    }
  }
  
  static func initialize(withConfigData configData: ConfigData) async {
    // To avoid creating an instance with the same config as the existing one
    if (configData.apiKey == brazeInstance?.configuration.api.key) {
      return
    }
    
    var delay = 0.0
    
    /*
     If the instance exists, then calling "initialize" means changing configurations
     and therefore preparing for creating a new instance
    */
    if (brazeInstance != nil) {
      /*
       To prevent receiving the same push notification more than once,
       it's required to unregister the previous device push token
       */
      await UIApplication.shared.unregisterForRemoteNotifications()
      
      // Wipe all the data created by previous instance, to avoid unexpected behavior of the new instance
      brazeInstance?.wipeData()
      
      // Remove references to the previous instance, so GC can deallocate it
      brazeInstance = nil
      BrazeReactBridge.deinitBraze()
      
      delay = 1.0
    }
    
    let configuration = Braze.Configuration(apiKey: configData.apiKey, endpoint: configData.endpoint)
    
    configuration.logger.level = .init(rawValue: configData.logLevel) ?? .debug
    configuration.push.automation = true
    configuration.push.automation.requestAuthorizationAtLaunch = false
    
    configuration.forwardUniversalLinks = true
    configuration.triggerMinimumTimeInterval = 5
    
    configuration.location.brazeLocationProvider = BrazeLocationProvider()
    configuration.location.automaticLocationCollection = true
    configuration.location.geofencesEnabled = true
    configuration.location.automaticGeofenceRequests = false
    
    await withCheckedContinuation { continuation in
      /*
       For some reason need to wait after de-initializing previous instance
       and before creating a new instance.
       Otherwise, push notifications for the new instance won't work
      */
      DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
        
        // A workaround for "Configuration" interfaces Swift<->Objective-C incompatibility
        brazeInstance = BrazeInitWorkaround.initBraze(configuration)
        
        let delegate = ApplicationBrazeDelegate()
        
        brazeInstance?.delegate = delegate
        // Need to enable the new instance after wiping up the data
        brazeInstance?.enabled = true
        
        if let launchOptions = launchOptions {
          BrazeReactUtils.sharedInstance().populateInitialUrl(fromLaunchOptions: launchOptions)
        }
        
        launchOptions = nil
        
        continuation.resume()
      }
    }
  }
}
