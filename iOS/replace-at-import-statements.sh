#! /bin/bash
# Unofficial Bash Strict Mode
set -euo pipefail
IFS=$'\n\t'

# This script replaces the `@import`` statements in the `.h` files in the various
# Braze SDK frameworks.
# This change is needed because `@import` statements are not directly supported
# in ObjC++ and adding the compiler flags to add support lead to other 
# compilation issues in Expo.

# This script has access to the whole Xcode build environment, so it can use
# environment variables to find the Braze SDK frameworks.

# Find Braze SDK headers in PODS_XCFRAMEWORKS_BUILD_DIR
headers=()
  while IFS= read -r -d $'\0'; do
      headers+=("$REPLY")
  done < <(find "$PODS_XCFRAMEWORKS_BUILD_DIR" -type f -name 'Braze*Swift.h' -print0)

# Replace @import module statements with #import statements
for header in "${headers[@]}"; do

  # Remove `@import` statements (not strictly necessary)
  perl -0777 -i -pe 's/(?:^\@import.*;\n)+/\n/gm' "$header"

  # BrazeKit
  if [[ $header == *"BrazeKit"* ]]; then
    # Add the required imports
    perl -0777 -i -pe 's/^\@class NSString;/#import <Foundation\/Foundation.h>\n#import <UIKit\/UIKit.h>\n#import <WebKit\/WebKit.h>\n\n\@class NSString;/gm' "$header"
  fi
  
done
