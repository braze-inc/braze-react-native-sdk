#import "BrazeUIHandler.h"
#import "BrazeReactUtils.h"
#import "BrazeReactDataTranslator.h"

@import BrazeKit;
@import BrazeUI;

@interface BrazeUIHandler () <BrazeInAppMessageUIDelegate, BrazeContentCardUIViewControllerDelegate>

@property (nonatomic) BOOL dismissFeedOnContentCardClick;

@end

@implementation BrazeUIHandler

- (instancetype)init {
  if (self = [super init]) {
    self.showInAppMessagesAutomaticallyInDefaultDelegate = YES;
  }
  return self;
}

/// Returns NO if there is an `inAppMessagePresenter` that has a custom delegate already set. Otherwise, returns YES.
- (BOOL)canSetDefaultInAppMessagePresenterDelegate:(Braze *)braze {
  BrazeInAppMessageUI *inAppMessageUI = (BrazeInAppMessageUI *)braze.inAppMessagePresenter;
  if ([inAppMessageUI respondsToSelector:@selector(delegate)]) {
    return inAppMessageUI.delegate == nil;
  } else {
    return NO;
  }
}

- (void)setDefaultInAppMessagePresenter:(Braze *)braze {
  BrazeInAppMessageUI *inAppMessageUI = [[BrazeInAppMessageUI alloc] init];
  braze.inAppMessagePresenter = inAppMessageUI;
}

- (void)useDefaultPresenterDelegate:(Braze *)braze {
  if (!braze.inAppMessagePresenter) {
    [self setDefaultInAppMessagePresenter:braze];
  }
  ((BrazeInAppMessageUI *)braze.inAppMessagePresenter).delegate = self;
}

- (void)deinitPresenterDelegate:(Braze *)braze {
  ((BrazeInAppMessageUI *)braze.inAppMessagePresenter).delegate = nil;
}

- (void)launchContentCards:(Braze *)braze dismissAutomatically:(BOOL)dismissAutomatically {
  UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
  UIViewController *mainViewController = keyWindow.rootViewController;
  self.dismissFeedOnContentCardClick = dismissAutomatically;

  if (![mainViewController.presentedViewController isKindOfClass:[BRZContentCardUIModalViewController class]]) {
    BRZContentCardUIModalViewController *contentCardsModal = [[BRZContentCardUIModalViewController alloc] initWithBraze:braze];
    contentCardsModal.navigationItem.title = @"Content Cards";
    contentCardsModal.viewController.delegate = self;

    [mainViewController presentViewController:contentCardsModal animated:YES completion:nil];
  }
}

- (void)dismissInAppMessage:(Braze *)braze {
  [(BrazeInAppMessageUI *)braze.inAppMessagePresenter dismiss];
}

#pragma mark - `BrazeInAppMessageUIDelegate`

- (enum BRZInAppMessageUIDisplayChoice)inAppMessage:(BrazeInAppMessageUI *)ui
                            displayChoiceForMessage:(BRZInAppMessageRaw *)message {
  NSDictionary* eventData = [BrazeReactDataTranslator formatInAppMessage:message];
  if (!eventData || [eventData count] == 0) {
    NSLog(@"Received malformed in-app message in iOS layer. Not sending to JS layer.");
  }

  // Send to JavaScript layer
  [self.eventEmitter sendEventWithName:@"inAppMessageReceived" body:eventData];
  
  if (self.showInAppMessagesAutomaticallyInDefaultDelegate) {
    return BRZInAppMessageUIDisplayChoiceNow;
  } else {
    return BRZInAppMessageUIDisplayChoiceDiscard;
  }
}

#pragma mark - `BrazeContentCardUIViewControllerDelegate`

- (BOOL)contentCardController:(BRZContentCardUIViewController *)controller
                shouldProcess:(NSURL *)url
                         card:(BRZContentCardRaw *)card {
  // In-app web view presentation requires the base modal to be available, so we don't want to dismiss it here.
  BOOL isSchemeBased = ![url.scheme isEqual:@"https"] && ![url.scheme isEqual:@"http"];
  if (!card.useWebView && self.dismissFeedOnContentCardClick && isSchemeBased) {
    [controller dismissViewControllerAnimated:YES completion:nil];
  }
  return YES;
}

@end
