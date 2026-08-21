@import Foundation;
@import XCTest;
@import BrazeKit;
@import BrazeUI;
@import braze_react_native_sdk;

@interface BrazeUIHandlerTests : XCTestCase
@property (nonatomic) Braze *braze;
@property (nonatomic) BrazeUIHandler *handler;
@end

@implementation BrazeUIHandlerTests

- (void)setUp {
  [super setUp];
  BRZConfiguration *configuration = [[BRZConfiguration alloc] initWithApiKey:@"test-key"
                                                                    endpoint:@"test-endpoint"];
  self.braze = [[Braze alloc] initWithConfiguration:configuration];
  self.handler = [[BrazeUIHandler alloc] init];
}

#pragma mark - canSetDefaultInAppMessagePresenterDelegate:

- (void)testCanSetDefaultDelegateWhenPresenterHasNoDelegate {
  BrazeInAppMessageUI *inAppMessageUI = [[BrazeInAppMessageUI alloc] init];
  self.braze.inAppMessagePresenter = inAppMessageUI;

  XCTAssertNil(inAppMessageUI.delegate);
  XCTAssertTrue([self.handler canSetDefaultInAppMessagePresenterDelegate:self.braze]);
}

- (void)testCanSetDefaultDelegateWhenHandlerIsAlreadyTheDelegate {
  // Simulates `subscribeToEvents` having already attached this handler as the
  // default in-app message delegate (e.g. because another RN listener was
  // registered first) before `subscribeToInAppMessage` runs.
  [self.handler useDefaultPresenterDelegate:self.braze];
  XCTAssertEqual(((BrazeInAppMessageUI *)self.braze.inAppMessagePresenter).delegate, self.handler);

  XCTAssertTrue([self.handler canSetDefaultInAppMessagePresenterDelegate:self.braze]);
}

- (void)testCannotSetDefaultDelegateWhenACustomDelegateIsSet {
  BrazeUIHandler *thirdPartyDelegate = [[BrazeUIHandler alloc] init];
  BrazeInAppMessageUI *inAppMessageUI = [[BrazeInAppMessageUI alloc] init];
  inAppMessageUI.delegate = (id<BrazeInAppMessageUIDelegate>)thirdPartyDelegate;
  self.braze.inAppMessagePresenter = inAppMessageUI;

  XCTAssertFalse([self.handler canSetDefaultInAppMessagePresenterDelegate:self.braze]);
}

#pragma mark - Regression: https://github.com/braze-inc/braze-react-native-sdk/issues/329

- (void)testShowInAppMessagesAutomaticallyFlagCanBeUpdatedAfterAnotherListenerRegistersFirst {
  // 1. Another RN listener (e.g. `contentCardsUpdated`) is registered first,
  //    which triggers `subscribeToEvents` and attaches the default delegate
  //    with `showInAppMessagesAutomaticallyInDefaultDelegate` still at its
  //    default value of YES.
  [self.handler useDefaultPresenterDelegate:self.braze];
  XCTAssertTrue(self.handler.showInAppMessagesAutomaticallyInDefaultDelegate);

  // 2. The app then calls `Braze.subscribeToInAppMessage(false, callback)`.
  //    Before the fix, `canSetDefaultInAppMessagePresenterDelegate:` returned
  //    NO here (delegate was non-nil), so the flag update below was skipped.
  XCTAssertTrue([self.handler canSetDefaultInAppMessagePresenterDelegate:self.braze]);
  self.handler.showInAppMessagesAutomaticallyInDefaultDelegate = NO;
  [self.handler useDefaultPresenterDelegate:self.braze];

  XCTAssertFalse(self.handler.showInAppMessagesAutomaticallyInDefaultDelegate);
}

@end
