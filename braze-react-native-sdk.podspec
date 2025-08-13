require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
braze_swift_version = '13.0.0'

Pod::Spec.new do |s|
  s.name           = 'braze-react-native-sdk'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.source         = { :git => 'git+https://github.com/braze-inc/braze-react-native-sdk.git', :tag => s.version }

  s.requires_arc   = true
  s.platform       = :ios, '12.0'

  s.preserve_paths = 'LICENSE.md', 'README.md', 'package.json', 'index.js'
  s.source_files   = 'iOS/**/*.{h,m,mm,swift}'

  s.dependency 'BrazeKit', "~> #{braze_swift_version}"
  s.dependency 'BrazeLocation', "~> #{braze_swift_version}"
  s.dependency 'BrazeUI', "~> #{braze_swift_version}"

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      s.pod_target_xcconfig = {
        'DEFINES_MODULE' => 'YES',
        'GCC_PREPROCESSOR_DEFINITIONS' => '$(inherited) COCOAPODS=1 RCT_NEW_ARCH_ENABLED=1',
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"${PODS_ROOT}/Headers/Private/Yoga\"",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }
    end
  end
end
