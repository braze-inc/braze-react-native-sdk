#import <BrazeKit/BrazeKit-Swift.h>
#import <React/RCTEventEmitter.h>

@interface BrazeUIHandler : NSObject

/// Determines if the default in-app message UI should display an incoming message.
/// If set to `NO`, the default `BrazeInAppMessageUIDelegate` will use the `.discard` option for displaying messages.
/// If set to `YES`, the delegate will use `.now` to display messages.
@property (nonatomic) BOOL showInAppMessagesAutomaticallyInDefaultDelegate;

@property (nonatomic, weak) RCTEventEmitter *eventEmitter;

- (BOOL)canSetDefaultInAppMessagePresenterDelegate:(Braze *)braze;
- (void)setDefaultInAppMessagePresenter:(Braze *)braze;
- (void)useDefaultPresenterDelegate:(Braze *)braze;
- (void)deinitPresenterDelegate:(Braze *)braze;
- (void)dismissInAppMessage:(Braze *)braze;
- (void)launchContentCards:(Braze *)braze dismissAutomatically:(BOOL)dismissAutomatically;

@end
