import BrazeKit

/// Native errors that map to a JS promise rejection for push unregistration / logout.
protocol ReactPushUnregistrationFailure: Error {
  var message: String { get }
  var isRetriable: Bool { get }
  var httpStatusCode: Int? { get }
}

extension Braze.PushUnregistrationError: ReactPushUnregistrationFailure {}

extension Braze.LogoutErrorResult: ReactPushUnregistrationFailure {
  var message: String { BrazePushLogoutMapping.message(for: errors) }

  /// Resolves the HTTP status code for a logout failure with these guidelines:
  /// 1. Prefer `unregisterPush`'s status code.
  /// 2. Fall back to `unregisterPushToStart`'s status code when `unregisterPush` has none.
  ///
  /// A success will not return a `LogoutErrorResult` so it is not relevant.
  var httpStatusCode: Int? { BrazePushLogoutMapping.httpStatusCode(for: errors) }
}

/// Maps Swift SDK push-unregistration / logout errors to a single JS error.
enum BrazePushLogoutMapping {

  /// Concatenates the error messages for each endpoint in the dictionary.
  static func message(
    for errors: [Braze.LogoutEndpoint: Braze.PushUnregistrationError]
  ) -> String {
    let parts = [Braze.LogoutEndpoint.unregisterPush, .unregisterPushToStart].compactMap { endpoint in
      errors[endpoint].map { "\(endpoint): \($0.message)" }
    }
    return parts.isEmpty ? "Logout failed." : parts.joined(separator: "; ")
  }

  /// Resolves the HTTP status code for a logout failure with these guidelines:
  /// 1. Prefer `unregisterPush`'s status code.
  /// 2. Fall back to `unregisterPushToStart`'s status code when `unregisterPush` has none.
  ///
  /// A success will not return a `LogoutErrorResult` so it is not relevant.
  static func httpStatusCode(
    for errors: [Braze.LogoutEndpoint: Braze.PushUnregistrationError]
  ) -> Int? {
    errors[.unregisterPush]?.httpStatusCode ?? errors[.unregisterPushToStart]?.httpStatusCode
  }

  static func details(for error: some ReactPushUnregistrationFailure) -> [String: AnyHashable] {
    var details: [String: AnyHashable] = ["isRetriable": error.isRetriable]
    if let httpStatusCode = error.httpStatusCode {
      details["httpStatusCode"] = httpStatusCode
    }
    return details
  }
}

/// Promise `code` values surfaced to JS.
enum BrazeReactErrorCode {
  static let unregisterPush = "UNREGISTER_PUSH_ERROR"
  static let logout = "LOGOUT_ERROR"
}

/// Policy when a bridge method is invoked before the SDK is initialized.
enum UninitializedPolicy {

  /// Metadata associated with the failure to surface to the integrator.
  static let failureDetails: [String: AnyHashable] = ["isRetriable": false]

  static func failureMessage(for method: String) -> String {
    "'\(method)' requires the Braze SDK to be initialized."
  }

  /// Non-optional so a nil error cannot complete the promise as success.
  static func clientError(code: String, method: String) -> BrazeReactClientError {
    BrazeReactClientError(
      code: code,
      message: failureMessage(for: method),
      details: failureDetails
    )
  }
}

/// RN-agnostic error surfaced by `BrazeReactPushLogout`.
///
/// `BrazeReactBridge` maps this to a promise rejection so that mapping doesn't depend on React.
struct BrazeReactClientError: Error, Equatable, @unchecked Sendable {
  let code: String
  let message: String
  let details: [String: AnyHashable]?

  /// This field is not carry any meaning and is here only because `NSError` requires an Int
  static let dummyErrorCode = -1

  init(code: String, message: String, details: [String: AnyHashable]? = nil) {
    self.code = code
    self.message = message
    self.details = details
  }

  /// Bridges this error across the ObjC promise boundary.
  /// - `domain` is the JS promise `code`
  /// - `userInfo` carries message details for JS.
  var nsError: NSError {
    var userInfo: [String: Any] = details ?? [:]
    userInfo[NSLocalizedDescriptionKey] = message
    return NSError(domain: code, code: Self.dummyErrorCode, userInfo: userInfo)
  }
}

/// Calls the Swift `unregisterPush` / `logout` APIs so typed errors stay available for mapping.
@objc(BrazeReactPushLogout)
public final class BrazeReactPushLogout: NSObject {

  @objc public static func unregisterPush(
    _ braze: Braze?,
    completion: @escaping (NSError?) -> Void
  ) {
    guard let braze else {
      completion(
        UninitializedPolicy.clientError(
          code: BrazeReactErrorCode.unregisterPush,
          method: "unregisterPush"
        ).nsError
      )
      return
    }
    braze.notifications.unregisterPush { nativeResult in
      switch mapPushUnregistration(nativeResult, errorCode: BrazeReactErrorCode.unregisterPush) {
      case .success:
        completion(nil)
      case .failure(let error):
        completion(error.nsError)
      }
    }
  }

  @objc public static func logout(
    _ braze: Braze?,
    completion: @escaping (NSError?) -> Void
  ) {
    guard let braze else {
      completion(
        UninitializedPolicy.clientError(
          code: BrazeReactErrorCode.logout,
          method: "logout"
        ).nsError
      )
      return
    }
    braze.logout { nativeResult in
      switch mapPushUnregistration(nativeResult, errorCode: BrazeReactErrorCode.logout) {
      case .success:
        completion(nil)
      case .failure(let error):
        completion(error.nsError)
      }
    }
  }

  static func mapPushUnregistration<Failure: ReactPushUnregistrationFailure>(
    _ nativeResult: Result<Void, Failure>,
    errorCode: String
  ) -> Result<Void, BrazeReactClientError> {
    switch nativeResult {
    case .success:
      return .success(())
    case .failure(let error):
      return .failure(BrazeReactClientError(
        code: errorCode,
        message: error.message,
        details: BrazePushLogoutMapping.details(for: error)
      ))
    }
  }
}
