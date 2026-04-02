import XCTest
import BrazeKit
import braze_react_native_sdk

final class BrazeReactInitializerTests: XCTestCase {

  override func tearDown() {
    super.tearDown()
    BrazeReactInitializer.configureClosure = nil
    BrazeReactInitializer.postInitializationClosure = nil
  }

  // MARK: - configure(_:postInitialization:) tests

  func testConfigureStoresConfigurationClosure() {
    BrazeReactInitializer.configure({ config in
      config.sessionTimeout = 42
    })
    XCTAssertNotNil(BrazeReactInitializer.configureClosure)

    let configuration = Braze.Configuration(apiKey: "test-key", endpoint: "test-endpoint")
    BrazeReactInitializer.configureClosure?(configuration)
    XCTAssertEqual(configuration.sessionTimeout, 42)
  }

  func testConfigureStoresPostInitializationClosure() {
    var receivedBraze: Braze?
    BrazeReactInitializer.configure({ _ in }) { braze in
      receivedBraze = braze
    }
    XCTAssertNotNil(BrazeReactInitializer.postInitializationClosure)

    let braze = Braze(configuration: .init(apiKey: "test-key", endpoint: "test-endpoint"))
    BrazeReactInitializer.postInitializationClosure?(braze)
    XCTAssertTrue(receivedBraze === braze)
  }

  func testConfigureWithNilPostInitialization() {
    BrazeReactInitializer.configure({ _ in })
    XCTAssertNotNil(BrazeReactInitializer.configureClosure)
    XCTAssertNil(BrazeReactInitializer.postInitializationClosure)
  }

  // MARK: - Closure behavior tests

  func testConfigurationClosureAppliesSettings() {
    let configuration = Braze.Configuration(apiKey: "test-key", endpoint: "test-endpoint")
    let configBlock: (Braze.Configuration) -> Void = { config in
      config.sessionTimeout = 42
    }
    configBlock(configuration)
    XCTAssertEqual(configuration.sessionTimeout, 42)
  }

  func testPostInitializationClosureReceivesBrazeInstance() {
    var receivedBraze: Braze?
    let postInitBlock: (Braze) -> Void = { braze in
      receivedBraze = braze
    }
    let braze = Braze(configuration: .init(apiKey: "test-key", endpoint: "test-endpoint"))
    postInitBlock(braze)
    XCTAssertTrue(receivedBraze === braze)
  }
}
