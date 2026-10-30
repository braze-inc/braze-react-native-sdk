#import <XCTest/XCTest.h>
#import "BrazeReactBridge.h"
#import "BrazeReactUtils.h"
#import "BrazeUIHandler.h"
#import "BrazeUI-Swift.h"

// Exercise the production bridge lifecycle without starting SDK network traffic.
@interface BrazeReactBridge (Testing)
+ (void)prepareForBrazeInstanceChange;
+ (void)setBrazeInstance:(Braze *)instance nativeOwned:(BOOL)nativeOwned;
- (void)initialize:(NSString *)apiKey endpoint:(NSString *)endpoint;
- (void)subscribeToInAppMessage:(BOOL)useBrazeUI callback:(RCTResponseSenderBlock)callback;
@end

@interface TestSubscription : NSObject
@property (copy, nonatomic) void (^update)(id);
- (void)cancel;
@end
@implementation TestSubscription
- (void)cancel {
  self.update = nil;
}
@end

@interface TestChannel : NSObject
@property (strong, nonatomic) NSHashTable<TestSubscription *> *subscriptions;
@property (nonatomic) NSUInteger subscriptionCount;
@property (readonly, nonatomic) NSUInteger activeSubscriptionCount;
- (id)subscribeToUpdates:(void (^)(id))update;
- (void)emit:(id)value;
@end
@implementation TestChannel
- (instancetype)init {
  if (self = [super init]) {
    _subscriptions = [NSHashTable weakObjectsHashTable];
  }
  return self;
}
- (id)subscribeToUpdates:(void (^)(id))update {
  TestSubscription *subscription = [TestSubscription new];
  subscription.update = update;
  [self.subscriptions addObject:subscription];
  self.subscriptionCount += 1;
  return subscription;
}
- (void)emit:(id)value {
  @autoreleasepool {
    for (TestSubscription *subscription in self.subscriptions.allObjects) {
      if (subscription.update) {
        subscription.update(value);
      }
    }
  }
}
- (NSUInteger)activeSubscriptionCount {
  NSUInteger count = 0;
  for (TestSubscription *subscription in self.subscriptions.allObjects) {
    if (subscription.update) {
      count += 1;
    }
  }
  return count;
}
@end

// Objective-C doubles implement only the SDK selectors used by subscriptions.
@interface TestBraze : NSObject
@property (weak, nonatomic) id sdkAuthDelegate;
@property (strong, nonatomic) id inAppMessagePresenter;
@property (strong, nonatomic) TestChannel *contentCards;
@property (strong, nonatomic) TestChannel *banners;
@property (strong, nonatomic) TestChannel *featureFlags;
@property (strong, nonatomic) TestChannel *notifications;
@end
@implementation TestBraze
- (instancetype)init {
  if (self = [super init]) {
    _contentCards = [TestChannel new];
    _banners = [TestChannel new];
    _featureFlags = [TestChannel new];
    _notifications = [TestChannel new];
  }
  return self;
}
@end

@interface TestBridge : BrazeReactBridge
@property (strong, nonatomic) NSMutableArray<NSString *> *events;
@end
@implementation TestBridge
- (instancetype)init {
  if (self = [super init]) {
    _events = [NSMutableArray new];
  }
  return self;
}
- (void)sendEventWithName:(NSString *)name body:(id)body {
  [self.events addObject:name];
}
@end

@interface BrazeReactBridgeTests : XCTestCase
@property (strong, nonatomic) TestBridge *bridge;
@property (strong, nonatomic) TestBraze *instance;
@end

@implementation BrazeReactBridgeTests
- (void)setUp {
  [super setUp];
  XCTAssertTrue([NSThread isMainThread]);
  self.bridge = [TestBridge new];
  self.instance = [TestBraze new];
  [BrazeReactBridge prepareForBrazeInstanceChange];
  [BrazeReactBridge setBrazeInstance:nil nativeOwned:NO];
}
- (void)tearDown {
  [self.bridge stopObserving];
  [BrazeReactBridge prepareForBrazeInstanceChange];
  [BrazeReactBridge setBrazeInstance:nil nativeOwned:NO];
  self.bridge = nil;
  self.instance = nil;
  [super tearDown];
}
- (void)adoptNativeInstance {
  [BrazeReactBridge useNativeBrazeInstance:(Braze *)self.instance];
}
- (void)assertActiveSubscriptions:(NSUInteger)count instance:(TestBraze *)instance {
  @autoreleasepool {
    for (TestChannel *channel in @[instance.contentCards, instance.banners,
                                  instance.featureFlags, instance.notifications]) {
      XCTAssertEqual(channel.activeSubscriptionCount, count);
    }
  }
}
- (void)testNativeDelegatesSurviveListenerCycles {
  NSObject *nativeAuthDelegate = [NSObject new];
  NSObject *nativeIAMDelegate = [NSObject new];
  BrazeInAppMessageUI *presenter = [BrazeInAppMessageUI new];
  presenter.delegate = (id)nativeIAMDelegate;
  self.instance.sdkAuthDelegate = nativeAuthDelegate;
  self.instance.inAppMessagePresenter = presenter;
  [self adoptNativeInstance];
  XCTAssertEqual([BrazeReactUtils braze], (Braze *)self.instance);
  for (NSUInteger i = 0; i < 2; i++) {
    [self.bridge startObserving];
    [self.bridge subscribeToInAppMessage:NO callback:nil];
    [self assertActiveSubscriptions:1 instance:self.instance];
    XCTAssertEqual(self.instance.sdkAuthDelegate, nativeAuthDelegate);
    XCTAssertEqual(self.instance.inAppMessagePresenter, presenter);
    XCTAssertEqual(presenter.delegate, nativeIAMDelegate);
    [self.bridge stopObserving];
    [self assertActiveSubscriptions:0 instance:self.instance];
    XCTAssertEqual(self.instance.sdkAuthDelegate, nativeAuthDelegate);
    XCTAssertEqual(presenter.delegate, nativeIAMDelegate);
  }
}
- (void)testNativeNilDelegatesRemainUnset {
  BrazeInAppMessageUI *presenter = [BrazeInAppMessageUI new];
  self.instance.inAppMessagePresenter = presenter;
  [self adoptNativeInstance];
  [self.bridge startObserving];
  [self.bridge subscribeToInAppMessage:NO callback:nil];
  XCTAssertNil(self.instance.sdkAuthDelegate);
  XCTAssertNil(presenter.delegate);
  [self.bridge stopObserving];
  XCTAssertNil(presenter.delegate);
}
- (void)testNativeCustomPresenterWithoutDelegateIsPreserved {
  NSObject *presenter = [NSObject new];
  self.instance.inAppMessagePresenter = presenter;
  [self adoptNativeInstance];
  [self.bridge startObserving];
  [self.bridge stopObserving];
  XCTAssertEqual(self.instance.inAppMessagePresenter, presenter);
}
- (void)testNativeInstanceWithoutPresenterIsPreserved {
  [self adoptNativeInstance];
  [self.bridge startObserving];
  [self.bridge subscribeToInAppMessage:YES callback:nil];
  [self.bridge stopObserving];
  XCTAssertNil(self.instance.inAppMessagePresenter);
}
- (void)testListenersBeforeAdoptionAndRepeatedAdoption {
  [self.bridge startObserving];
  [self adoptNativeInstance];
  [self adoptNativeInstance];
  [self.bridge startObserving];
  [self assertActiveSubscriptions:1 instance:self.instance];
  XCTAssertEqual(self.instance.banners.subscriptionCount, 1u);
  [self.instance.banners emit:@{}];
  [self.instance.contentCards emit:@[]];
  [self.instance.featureFlags emit:@[]];
  XCTAssertEqualObjects(self.bridge.events, (@[@"bannerCardsUpdated", @"contentCardsUpdated", @"featureFlagsUpdated"]));
}
- (void)testReplacementMovesListenersAndCancelsOldSubscriptions {
  [self adoptNativeInstance];
  [self.bridge startObserving];
  TestBraze *replacement = [TestBraze new];
  [BrazeReactBridge useNativeBrazeInstance:(Braze *)replacement];
  [self assertActiveSubscriptions:0 instance:self.instance];
  [self assertActiveSubscriptions:1 instance:replacement];
  XCTAssertEqual([BrazeReactUtils braze], (Braze *)replacement);
  [self.instance.banners emit:@{}];
  [replacement.banners emit:@{}];
  XCTAssertEqualObjects(self.bridge.events, (@[@"bannerCardsUpdated"]));
  [self.bridge stopObserving];
  [self assertActiveSubscriptions:0 instance:replacement];
}
- (void)testJavaScriptInitializationDoesNotReplaceNativeInstance {
  [self adoptNativeInstance];
  [self.bridge startObserving];
  [self.bridge initialize:@"unused-key" endpoint:@"unused.example"];
  XCTAssertEqual([BrazeReactUtils braze], (Braze *)self.instance);
  XCTAssertEqual(self.instance.banners.subscriptionCount, 1u);
  XCTAssertNil(self.instance.sdkAuthDelegate);
}
- (void)testReactOwnedDefaultsAreInstalledAndReleased {
  [BrazeReactBridge setBrazeInstance:(Braze *)self.instance nativeOwned:NO];
  BrazeInAppMessageUI *presenter = self.instance.inAppMessagePresenter;
  XCTAssertNotNil(presenter);
  for (NSUInteger i = 0; i < 2; i++) {
    [self.bridge startObserving];
    XCTAssertEqual(self.instance.sdkAuthDelegate, self.bridge);
    XCTAssertNotNil(presenter.delegate);
    [self.bridge stopObserving];
    XCTAssertNil(self.instance.sdkAuthDelegate);
    XCTAssertNil(presenter.delegate);
  }
}
- (void)testReactOwnedTeardownPreservesDelegateHandoff {
  [BrazeReactBridge setBrazeInstance:(Braze *)self.instance nativeOwned:NO];
  [self.bridge startObserving];
  NSObject *nativeDelegate = [NSObject new];
  BrazeInAppMessageUI *presenter = self.instance.inAppMessagePresenter;
  self.instance.sdkAuthDelegate = nativeDelegate;
  presenter.delegate = (id)nativeDelegate;
  [self.bridge stopObserving];
  [self.bridge startObserving];
  [self.bridge stopObserving];
  XCTAssertEqual(self.instance.sdkAuthDelegate, nativeDelegate);
  XCTAssertEqual(presenter.delegate, nativeDelegate);
}
- (void)testPresenterReplacementClearsOnlyOriginalOwnedDelegate {
  [BrazeReactBridge setBrazeInstance:(Braze *)self.instance nativeOwned:NO];
  [self.bridge startObserving];
  BrazeInAppMessageUI *oldPresenter = self.instance.inAppMessagePresenter;
  NSObject *replacement = [NSObject new];
  self.instance.inAppMessagePresenter = replacement;
  [self.bridge stopObserving];
  XCTAssertNil(oldPresenter.delegate);
  XCTAssertEqual(self.instance.inAppMessagePresenter, replacement);
}
- (void)testAdoptingReactOwnedInstanceReleasesBridgeDelegates {
  [BrazeReactBridge setBrazeInstance:(Braze *)self.instance nativeOwned:NO];
  [self.bridge startObserving];
  BrazeInAppMessageUI *presenter = self.instance.inAppMessagePresenter;
  [self adoptNativeInstance];
  XCTAssertNil(self.instance.sdkAuthDelegate);
  XCTAssertNil(presenter.delegate);
  XCTAssertEqual(self.instance.inAppMessagePresenter, presenter);
  [self assertActiveSubscriptions:1 instance:self.instance];
}
- (void)testStoppingOldBridgeDoesNotClearNewBridgeDelegates {
  [BrazeReactBridge setBrazeInstance:(Braze *)self.instance nativeOwned:NO];
  [self.bridge startObserving];
  TestBridge *other = [TestBridge new];
  [other startObserving];
  BrazeInAppMessageUI *presenter = self.instance.inAppMessagePresenter;
  [self.bridge stopObserving];
  XCTAssertEqual(self.instance.sdkAuthDelegate, other);
  XCTAssertNotNil(presenter.delegate);
  [other stopObserving];
  XCTAssertNil(self.instance.sdkAuthDelegate);
  XCTAssertNil(presenter.delegate);
}
@end
