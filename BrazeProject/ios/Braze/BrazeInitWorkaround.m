#import "BrazeInitWorkaround.h"
#import "BrazeReactBridge.h"

@implementation BrazeInitWorkaround

+ (Braze *)initBraze:(BRZConfiguration *)configuration {
  return [BrazeReactBridge initBraze:configuration];
}

@end
