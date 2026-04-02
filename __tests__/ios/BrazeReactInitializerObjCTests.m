@import Foundation;
@import XCTest;
@import BrazeKit;
@import braze_react_native_sdk;

@interface BrazeReactInitializerObjCTests : XCTestCase
@end

@implementation BrazeReactInitializerObjCTests

- (void)tearDown {
  [super tearDown];
  BrazeReactInitializer.configureClosure = nil;
  BrazeReactInitializer.postInitializationClosure = nil;
}

#pragma mark - Class availability

- (void)testClassIsAccessible {
  XCTAssertNotNil([BrazeReactInitializer class]);
}

#pragma mark - configureClosure property

- (void)testConfigureClosureReadWrite {
  XCTAssertNil(BrazeReactInitializer.configureClosure);

  BrazeReactInitializer.configureClosure = ^(BRZConfiguration *configuration) {
    configuration.sessionTimeout = 42;
  };
  XCTAssertNotNil(BrazeReactInitializer.configureClosure);

  BRZConfiguration *configuration = [[BRZConfiguration alloc] initWithApiKey:@"test-key"
                                                                    endpoint:@"test-endpoint"];
  BrazeReactInitializer.configureClosure(configuration);
  XCTAssertEqual(configuration.sessionTimeout, 42);
}

#pragma mark - postInitializationClosure property

- (void)testPostInitializationClosureReadWrite {
  XCTAssertNil(BrazeReactInitializer.postInitializationClosure);

  __block Braze *receivedBraze = nil;
  BrazeReactInitializer.postInitializationClosure = ^(Braze *braze) {
    receivedBraze = braze;
  };
  XCTAssertNotNil(BrazeReactInitializer.postInitializationClosure);

  BRZConfiguration *configuration = [[BRZConfiguration alloc] initWithApiKey:@"test-key"
                                                                    endpoint:@"test-endpoint"];
  Braze *braze = [[Braze alloc] initWithConfiguration:configuration];
  BrazeReactInitializer.postInitializationClosure(braze);
  XCTAssertEqualObjects(receivedBraze, braze);
}

#pragma mark - configure:postInitialization: method

- (void)testConfigureMethodIsCallable {
  [BrazeReactInitializer configure:^(BRZConfiguration *configuration) {
    configuration.sessionTimeout = 99;
  } postInitialization:^(Braze *braze) {}];

  XCTAssertNotNil(BrazeReactInitializer.configureClosure);
  XCTAssertNotNil(BrazeReactInitializer.postInitializationClosure);
}

- (void)testConfigureMethodWithNilPostInitialization {
  [BrazeReactInitializer configure:^(BRZConfiguration *configuration) {
    configuration.sessionTimeout = 99;
  } postInitialization:nil];

  XCTAssertNotNil(BrazeReactInitializer.configureClosure);
}

- (void)testConfigureClosureAppliesSettings {
  [BrazeReactInitializer configure:^(BRZConfiguration *configuration) {
    configuration.sessionTimeout = 99;
  } postInitialization:nil];

  BRZConfiguration *configuration = [[BRZConfiguration alloc] initWithApiKey:@"test-key"
                                                                    endpoint:@"test-endpoint"];
  BrazeReactInitializer.configureClosure(configuration);
  XCTAssertEqual(configuration.sessionTimeout, 99);
}

@end
