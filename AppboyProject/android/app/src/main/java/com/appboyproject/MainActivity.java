package com.appboyproject;

import com.appboy.Constants;
import com.appboy.models.IInAppMessage;
import com.appboy.models.MessageButton;
import com.appboy.ui.inappmessage.AppboyInAppMessageManager;
import com.appboy.ui.inappmessage.InAppMessageCloser;
import com.appboy.ui.inappmessage.InAppMessageOperation;
import com.appboy.ui.inappmessage.listeners.IInAppMessageManagerListener;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {
  private static final String TAG = String.format("%s.%s", Constants.APPBOY_LOG_TAG_PREFIX, MainActivity.class.getName());

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Intent intent = getIntent();
    Uri data = intent.getData();
    if (data != null) {
      Toast.makeText(this, "Activity opened by deep link: " + data.toString(), Toast.LENGTH_LONG);
      Log.i(TAG, "Deep link is " + data.toString());
    }
    class BrazeInAppMessageManagerListener implements IInAppMessageManagerListener {
      @Override
      public boolean onInAppMessageReceived(IInAppMessage inAppMessage) {
        return false;
      }

      @Override
      public InAppMessageOperation beforeInAppMessageDisplayed(IInAppMessage inAppMessage) {
        WritableMap parameters = new WritableNativeMap();
        parameters.putString("inAppMessage", inAppMessage.forJsonPut().toString());
        getReactNativeHost().getReactInstanceManager().getCurrentReactContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("inAppMessageReceived", parameters);
        // Note: return InAppMessageOperation.DISCARD if you would like
        // to prevent the Braze SDK from displaying the message natively.
        return InAppMessageOperation.DISPLAY_NOW;
      }

      @Override
      public boolean onInAppMessageClicked(IInAppMessage inAppMessage, InAppMessageCloser inAppMessageCloser) {
        return false;
      }

      @Override
      public boolean onInAppMessageButtonClicked(IInAppMessage inAppMessage, MessageButton button, InAppMessageCloser inAppMessageCloser) {
        return false;
      }

      @Override
      public void onInAppMessageDismissed(IInAppMessage inAppMessage) { }

      @Override
      public void beforeInAppMessageViewOpened(View inAppMessageView, IInAppMessage inAppMessage) { }

      @Override
      public void afterInAppMessageViewOpened(View inAppMessageView, IInAppMessage inAppMessage) { }

      @Override
      public void beforeInAppMessageViewClosed(View inAppMessageView, IInAppMessage inAppMessage) { }

      @Override
      public void afterInAppMessageViewClosed(IInAppMessage inAppMessage) { }
    }
    AppboyInAppMessageManager.getInstance().setCustomInAppMessageManagerListener(new BrazeInAppMessageManagerListener());
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
      return "AppboyProject";
  }
}
