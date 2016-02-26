#import "ABKReactBridgeTest.h"
#import "RCTLog.h"

@implementation ABKReactBridgeTest

RCT_EXPORT_METHOD(callBridge:(NSString *)value)
{
  RCTLogInfo(@"Called bridge with value %@", value);
}

RCT_EXPORT_MODULE();

@end
