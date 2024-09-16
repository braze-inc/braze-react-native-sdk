#import "BrazeReactGIFHelper.h"
#import <SDWebImage/SDAnimatedImage.h>
#import <SDWebImage/SDAnimatedImageView.h>

@import BrazeUI;

// Braze InAppMessage GIF Support
@implementation BrazeReactGIFHelper

+ (void)setGIFProvider {
  BRZGIFViewProvider.shared = [BrazeReactGIFHelper sdWebImage];
}

+ (BRZGIFViewProvider *)sdWebImage {
  return [BRZGIFViewProvider
          providerWithView:^UIView *_Nonnull(NSURL *_Nullable url) {
    UIImage *image = [BrazeReactGIFHelper imageForURL:url];
    SDAnimatedImageView *view =
    [[SDAnimatedImageView alloc] initWithImage:image];
    return view;
  }
          updateView:^(UIView *_Nonnull view, NSURL *_Nullable url) {
    if ([view isKindOfClass:[SDAnimatedImageView class]]) {
      ((SDAnimatedImageView *)(view)).image =
      [BrazeReactGIFHelper imageForURL:url];
    }
  }];
}

+ (UIImage *)imageForURL:(NSURL *)url {
  if (url == nil) {
    return nil;
  }
  if ([url.pathExtension isEqualToString:@"gif"]) {
    return [SDAnimatedImage imageWithContentsOfFile:url.path];
  } else {
    return [UIImage imageWithContentsOfFile:url.path];
  }
}

@end
