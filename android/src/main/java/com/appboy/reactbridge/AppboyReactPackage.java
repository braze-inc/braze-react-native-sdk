package com.appboy.reactbridge;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class AppboyReactPackage implements ReactPackage {

  @Override
  public List<NativeModule> createNativeModules(
    ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();

    modules.add(new AppboyReactBridge(reactContext));
    return modules;
  }

  // This "Override" method is being kept for backwards compatibilty with React Native
  // releases earlier than https://github.com/facebook/react-native/releases/tag/v0.47.0
  public List<Class<? extends JavaScriptModule>> createJSModules() {
    return Collections.emptyList();
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Arrays.<ViewManager>asList();
  }
}
