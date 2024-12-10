#import <Foundation/Foundation.h>
#import <BrazeKit/BrazeKit-Swift.h>

@interface BrazeInitWorkaround: NSObject
+ (Braze *)initBraze:(NSObject *)configuration;
@end
