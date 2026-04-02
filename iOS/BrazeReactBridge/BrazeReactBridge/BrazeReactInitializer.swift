import BrazeKit

/// Configures the Braze SDK for delayed initialization in React Native.
///
/// Call ``configure(_:postInitialization:)`` in your `AppDelegate` before
/// React Native starts. The stored closures are applied later when the
/// JavaScript layer calls `Braze.initialize(apiKey, endpoint)`.
@objcMembers
public class BrazeReactInitializer: NSObject {

  /// Stored configuration closure, applied to the `Braze.Configuration`
  /// when the JS `initialize` method is called.
  public static var configureClosure: ((Braze.Configuration) -> Void)?

  /// Stored post-initialization closure, called after the Braze instance
  /// is created.
  public static var postInitializationClosure: ((Braze) -> Void)?

  /// Stores configuration closures for delayed initialization.
  ///
  /// Call this method as early as possible in your AppDelegate
  /// `didFinishLaunching` to set up non-API-key configurations
  /// (e.g. `triggerMinimumTimeInterval`, `push.automation`) before
  /// the JS layer triggers initialization via `Braze.initialize(apiKey, endpoint)`.
  ///
  /// - Parameters:
  ///   - configure: A closure that receives a `Braze.Configuration` instance.
  ///     Use this to set all desired configuration properties.
  ///   - postInitialization: An optional closure executed after the Braze
  ///     instance is created. Use this for setup that requires the live
  ///     `Braze` instance (e.g. setting the delegate).
  public static func configure(
    _ configure: @escaping (Braze.Configuration) -> Void,
    postInitialization: ((Braze) -> Void)? = nil
  ) {
    Braze.prepareForDelayedInitialization()
    configureClosure = configure
    postInitializationClosure = postInitialization
  }
}
