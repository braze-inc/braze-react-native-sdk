package com.appboyproject;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.braze.models.inappmessage.IInAppMessage;
import com.braze.models.inappmessage.MessageButton;
import com.braze.support.BrazeLogger;
import com.braze.ui.inappmessage.BrazeInAppMessageManager;
import com.braze.ui.inappmessage.InAppMessageCloser;
import com.braze.ui.inappmessage.InAppMessageOperation;
import com.braze.ui.inappmessage.listeners.IInAppMessageManagerListener;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {
  private static final String TAG = BrazeLogger.getBrazeLogTag(MainActivity.class);

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Intent intent = getIntent();
    Uri data = intent.getData();
    if (data != null) {
      Toast.makeText(this, "Activity opened by deep link: " + data.toString(), Toast.LENGTH_LONG).show();
      Log.i(TAG, "Deep link is " + data.toString());
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
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
