package com.appboy.reactbridge;

import android.content.Intent;
import android.util.Log;

import com.appboy.Appboy;
import com.appboy.enums.Gender;
import com.appboy.enums.Month;
import com.appboy.enums.NotificationSubscriptionType;
import com.appboy.models.outgoing.AppboyProperties;
import com.appboy.support.AppboyLogger;
import com.appboy.ui.activities.AppboyFeedActivity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;

import org.json.JSONObject;

import java.math.BigDecimal;

public class AppboyReactBridge extends ReactContextBaseJavaModule {
  private static final String TAG = String.format("Appboy.%s", AppboyReactBridge.class.getName());

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";

  public AppboyReactBridge(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "AppboyReactBridge";
  }

  @ReactMethod
  public void changeUser(String userName) {
    Appboy.getInstance(getReactApplicationContext()).changeUser(userName);
  }

  @ReactMethod
  public void logCustomEvent(String eventName, ReadableMap eventProperties) {
    Appboy.getInstance(getReactApplicationContext()).logCustomEvent(eventName, populateEventPropertiesFromReadableMap(eventProperties));
  }

  private AppboyProperties populateEventPropertiesFromReadableMap(ReadableMap eventProperties) {
    AppboyProperties properties = new AppboyProperties();
    ReadableMapKeySetIterator keySetIterator = eventProperties.keySetIterator();
    if (eventProperties != JSONObject.NULL) {
      while (keySetIterator.hasNextKey()) {
        String key = keySetIterator.nextKey();
        ReadableType readableType = eventProperties.getType(key);
        if (readableType == ReadableType.String) {
          properties.addProperty(key, eventProperties.getString(key));
        } else if (readableType == ReadableType.Boolean) {
          properties.addProperty(key, eventProperties.getBoolean(key));
        } else if (readableType == ReadableType.Number) {
          // TODO (Brian) - is there a better way to descern double from int?
          try {
            properties.addProperty(key, eventProperties.getDouble(key));
          } catch (Exception e) {
            try {
              properties.addProperty(key, eventProperties.getInt(key));
            } catch (Exception e2) {
              AppboyLogger.e(TAG, "Could not parse ReadableType.Number from ReadableMap");
            }
          }
        } else {
          AppboyLogger.e(TAG, "Could map ReadableType to an AppboyProperty value");
        }
      }
    }
    return properties;
  }

  @ReactMethod
  public void logPurchase(String productIdentifier, String price, String currencyCode, int quantity, ReadableMap eventProperties) {
    Appboy.getInstance(getReactApplicationContext()).logPurchase(productIdentifier, currencyCode, new BigDecimal(price), quantity, populateEventPropertiesFromReadableMap(eventProperties));
  }

  @ReactMethod
  public void submitFeedback(String replyToEmail, String message, boolean isReportingABug) {
    Appboy.getInstance(getReactApplicationContext()).submitFeedback(replyToEmail, message, isReportingABug);
  }

  @ReactMethod
  public void setStringCustomUserAttribute(String key, String value) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
  }

  @ReactMethod
  public void setBoolCustomUserAttribute(String key, Boolean value) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
  }

  @ReactMethod
  public void setIntCustomUserAttribute(String key, int value) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
  }

  @ReactMethod
  public void setDoubleCustomUserAttribute(String key, float value) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
  }

  @ReactMethod
  public void setDateCustomUserAttribute(String key, int timeStamp) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttributeToSecondsFromEpoch(key, timeStamp);
  }

  @ReactMethod
  public void incrementCustomUserAttribute(String key, int incrementValue) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().incrementCustomUserAttribute(key, incrementValue);
  }

  @ReactMethod
  public void unsetCustomUserAttribute(String key) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().unsetCustomUserAttribute(key);
  }

  @ReactMethod
  public void setCustomUserAttributeArray(String key, ReadableArray value) {
    int size = value.size();
    String[] attributeArray = new String[size];
    for (int i = 0; i < size; i++) {
      attributeArray[i] = value.getString(i);
    }
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomAttributeArray(key, attributeArray);
  }

  @ReactMethod
  public void addToCustomAttributeArray(String key, String value) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().addToCustomAttributeArray(key, value);
  }

  @ReactMethod
  public void removeFromCustomAttributeArray(String key, String value) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().removeFromCustomAttributeArray(key, value);
  }

  @ReactMethod
  public void setFirstName(String firstName) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setFirstName(firstName);
  }

  @ReactMethod
  public void setLastName(String lastName) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setLastName(lastName);
  }

  @ReactMethod
  public void setEmail(String email) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setEmail(email);
  }

  @ReactMethod
  public void setGender(String gender) {
    Gender genderEnum;
    if (gender.toUpperCase().startsWith("M")) {
      genderEnum = Gender.MALE;
    } else if (gender.toUpperCase().startsWith("F")) {
      genderEnum = Gender.FEMALE;
    } else {
      return;
    }
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setGender(genderEnum);
  }

  @ReactMethod
  public void setDateOfBirth(int year, int month, int day) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setDateOfBirth(year, parseMonth(month), day);
  }

  @ReactMethod
  public void setCountry(String country) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCountry(country);
  }

  @ReactMethod
  public void setHomeCity(String homeCity) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setHomeCity(homeCity);
  }

  @ReactMethod
  public void setPhoneNumber(String phoneNumber) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setPhoneNumber(phoneNumber);
  }

  @ReactMethod
  public void setAvatarImageUrl(String avatarImageUrl) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setAvatarImageUrl(avatarImageUrl);
  }

  @ReactMethod
  public void setPushNotificationSubscriptionType(String subscriptionType) {
    NotificationSubscriptionType notificationSubscriptionType;
    if (subscriptionType == "subscribed") {
      notificationSubscriptionType = NotificationSubscriptionType.SUBSCRIBED;
    } else if (subscriptionType == "unsubscribed") {
      notificationSubscriptionType = NotificationSubscriptionType.UNSUBSCRIBED;
    } else if (subscriptionType == "optedin") {
      notificationSubscriptionType = NotificationSubscriptionType.OPTED_IN;
    } else {
      return;
    }
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setPushNotificationSubscriptionType(notificationSubscriptionType);
  }

  @ReactMethod
  public void setEmailNotificationSubscriptionType(String subscriptionType) {
    NotificationSubscriptionType notificationSubscriptionType;
    if (subscriptionType == "subscribed") {
      notificationSubscriptionType = NotificationSubscriptionType.SUBSCRIBED;
    } else if (subscriptionType == "unsubscribed") {
      notificationSubscriptionType = NotificationSubscriptionType.UNSUBSCRIBED;
    } else if (subscriptionType == "optedin") {
      notificationSubscriptionType = NotificationSubscriptionType.OPTED_IN;
    } else {
      return;
    }
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setEmailNotificationSubscriptionType(notificationSubscriptionType);
  }

  @ReactMethod
  public void launchNewsFeed() {
    Intent intent = new Intent(getCurrentActivity(), AppboyFeedActivity.class);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    this.getReactApplicationContext().startActivity(intent);
  }

  @ReactMethod
  public void launchFeedback() {
    Log.i(TAG, "Launch feedback actions are not currently supported on Android. Doing nothing.");
  }

  private Month parseMonth(int monthInt) {
    switch (monthInt) {
      case 1:
        return Month.JANUARY;
      case 2:
        return Month.FEBRUARY;
      case 3:
        return Month.MARCH;
      case 4:
        return Month.APRIL;
      case 5:
        return Month.MAY;
      case 6:
        return Month.JUNE;
      case 7:
        return Month.JULY;
      case 8:
        return Month.AUGUST;
      case 9:
        return Month.SEPTEMBER;
      case 10:
        return Month.OCTOBER;
      case 11:
        return Month.NOVEMBER;
      case 12:
        return Month.DECEMBER;
      default:
        return null;
    }
  }
}