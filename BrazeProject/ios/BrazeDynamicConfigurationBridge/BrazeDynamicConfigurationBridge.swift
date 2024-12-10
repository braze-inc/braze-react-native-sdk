import Foundation

@objc(BrazeDynamicConfigurationBridge)
public class BrazeDynamicConfigurationBridge: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc func saveConfig(
    _ configOptions: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      try BrazeDynamicConfiguration.saveConfig(fromDictionary: configOptions)
      
      resolve(nil)
    } catch let error as NSError {
      reject(error.domain, error.localizedDescription, error)
    } catch let error {
      reject("BrazeDynamicConfigurationBridge", "Saving failed", error)
    }
  }
  
  @objc func initializeWithSavedConfig(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        try await BrazeDynamicConfiguration.initializeWithSavedConfig()
        
        resolve(nil)
      } catch let error as NSError {
        reject(error.domain, error.localizedDescription, error)
      } catch let error {
        reject("BrazeDynamicConfigurationBridge", "Saving failed", error)
      }
    }
  }
}
