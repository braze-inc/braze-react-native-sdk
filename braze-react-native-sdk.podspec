require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

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

  install_modules_dependencies(s)

  s.dependency 'BrazeKit', '~> 9.0.0'
  s.dependency 'BrazeLocation', '~> 9.0.0'
  s.dependency 'BrazeUI', '~> 9.0.0'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.pod_target_xcconfig = {
      'DEFINES_MODULE' => 'YES',
      'GCC_PREPROCESSOR_DEFINITIONS' => '$(inherited) COCOAPODS=1 RCT_NEW_ARCH_ENABLED=1',
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
  end
end
