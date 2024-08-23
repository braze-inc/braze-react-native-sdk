#import "BrazeUIHandler.h"

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
  NSData *inAppMessageData = [message json];
  NSString *inAppMessageString = [[NSString alloc] initWithData:inAppMessageData encoding:NSUTF8StringEncoding];
  NSDictionary *arguments = @{
    @"inAppMessage" : inAppMessageString
  };
  
  // Send to JavaScript
  [self.eventEmitter sendEventWithName:@"inAppMessageReceived" body:arguments];
  
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
