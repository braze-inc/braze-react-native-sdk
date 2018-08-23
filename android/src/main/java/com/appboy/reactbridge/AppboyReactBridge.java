package com.appboy.reactbridge;

import android.content.Intent;
import android.util.Log;

import com.appboy.Appboy;
import com.appboy.services.AppboyLocationService;
import com.appboy.enums.Gender;
import com.appboy.enums.Month;
import com.appboy.enums.NotificationSubscriptionType;
import com.appboy.enums.CardCategory;
import com.appboy.events.FeedUpdatedEvent;
import com.appboy.events.IEventSubscriber;
import com.appboy.models.outgoing.AppboyProperties;
import com.appboy.models.outgoing.FacebookUser;
import com.appboy.models.outgoing.TwitterUser;
import com.appboy.support.AppboyLogger;
import com.appboy.ui.activities.AppboyFeedActivity;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Callback;

import org.json.JSONObject;

import java.lang.Integer;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AppboyReactBridge extends ReactContextBaseJavaModule {
  private static final String TAG = String.format("Appboy.%s", AppboyReactBridge.class.getName());
  private static final String CARD_COUNT_TAG = "card count";
  private static final String UNREAD_CARD_COUNT_TAG = "unread card count";
  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";
  private static final String ALL_CATEGORIES = "all";
  private final Object mCallbackWasCalledMapLock = new Object();
  private Map<Callback, IEventSubscriber<FeedUpdatedEvent>> mFeedSubscriberMap = new ConcurrentHashMap<Callback, IEventSubscriber<FeedUpdatedEvent>>();
  private Map<Callback, Boolean> mCallbackWasCalledMap = new ConcurrentHashMap<Callback, Boolean>();
  private FeedUpdatedEvent lastFeedEvent;
  private IEventSubscriber<FeedUpdatedEvent> feedUpdatedSubscriber;

  public AppboyReactBridge(ReactApplicationContext reactContext) {
    super(reactContext);
    feedUpdatedSubscriber = new IEventSubscriber<>() {
      @Override
      public void trigger(final FeedUpdatedEvent event) {
        lastFeedEvent = event;
        final WritableMap params = Arguments.createMap();
        params.putBoolean("updateSuccessful", true);
        sendEvent("FeedUpdated", params);
      }
    }
    Appboy.getInstance(getReactApplicationContext()).subscribeToFeedUpdates(feedUpdatedSubscriber);
  }

  @Override
  public String getName() {
    return "AppboyReactBridge";
  }

  // Note that for non-primitive or non-String arguments, Callbacks must be invoked with `Writable`
  // components from the `com.facebook.react.bridge` package (e.g., `WritableArray` or `WritableMap`).
  // Attempting to pass other types will result in a "Cannot convert argument of type class X" error.
  // For reference: https://github.com/facebook/react-native/issues/3101#issuecomment-143954448
  private void reportResultWithCallback(Callback callback, String error, Object result) {
    if (callback != null) {
      if (error != null) {
        callback.invoke(error);
      } else {
        callback.invoke(null, result);
      }
    } else {
      AppboyLogger.w(TAG, "Warning: AppboyReactBridge callback was null.");
    }
  }

  private void sendEvent(String eventName, @Nullable WritableMap params) {
    getReactApplicationContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, params);
  }

  @ReactMethod
  public void setSDKFlavor() {
    // Dummy method required for the iOS SDK flavor implementation; see AppboyReactBridge.setSDKFlavor()
    // in index.js. The Android bridge sets the REACT SDK flavor via an appboy.xml parameter.
  }

  @ReactMethod
  public void requestImmediateDataFlush() {
    Appboy.getInstance(getReactApplicationContext()).requestImmediateDataFlush();
  }

  @ReactMethod
  public void changeUser(String userName) {
    Appboy.getInstance(getReactApplicationContext()).changeUser(userName);
  }

  @ReactMethod
  public void registerPushToken(String token) {
    Appboy.getInstance(getReactApplicationContext()).registerAppboyPushMessages(token);
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
          AppboyLogger.e(TAG, "Could not map ReadableType to an AppboyProperty value");
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
  public void submitFeedback(String replyToEmail, String message, boolean isReportingABug, Callback callback) {
    Appboy.getInstance(getReactApplicationContext()).submitFeedback(replyToEmail, message, isReportingABug);
    // Always return true as Android doesn't support getting a result from submitFeedback().
    reportResultWithCallback(callback, null, true);
  }

  @ReactMethod
  public void setStringCustomUserAttribute(String key, String value, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void setBoolCustomUserAttribute(String key, Boolean value, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void setIntCustomUserAttribute(String key, int value, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void setDoubleCustomUserAttribute(String key, float value, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttribute(key, value);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void setDateCustomUserAttribute(String key, int timeStamp, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomUserAttributeToSecondsFromEpoch(key, timeStamp);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void incrementCustomUserAttribute(String key, int incrementValue, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().incrementCustomUserAttribute(key, incrementValue);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void unsetCustomUserAttribute(String key, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().unsetCustomUserAttribute(key);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void setCustomUserAttributeArray(String key, ReadableArray value, Callback callback) {
    int size = value.size();
    String[] attributeArray = new String[size];
    for (int i = 0; i < size; i++) {
      attributeArray[i] = value.getString(i);
    }
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setCustomAttributeArray(key, attributeArray);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void addToCustomAttributeArray(String key, String value, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().addToCustomAttributeArray(key, value);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void removeFromCustomAttributeArray(String key, String value, Callback callback) {
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().removeFromCustomAttributeArray(key, value);
    reportResultWithCallback(callback, null, result);
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
  public void setGender(String gender, Callback callback) {
    Gender genderEnum;
    if (gender == null) {
      reportResultWithCallback(callback, "Input Gender was null. Gender not set.", null);
      return;
    } else if (gender.toUpperCase().startsWith("F")) {
      genderEnum = Gender.FEMALE;
    } else if (gender.toUpperCase().startsWith("M")) {
      genderEnum = Gender.MALE;
    } else if (gender.toUpperCase().startsWith("N")) {
      genderEnum = Gender.NOT_APPLICABLE;
    } else if (gender.toUpperCase().startsWith("O")) {
      genderEnum = Gender.OTHER;
    } else if (gender.toUpperCase().startsWith("P")) {
      genderEnum = Gender.PREFER_NOT_TO_SAY;
    } else if (gender.toUpperCase().startsWith("U")) {
      genderEnum = Gender.UNKNOWN;
    } else {
      reportResultWithCallback(callback, "Invalid input " + gender + ". Gender not set.", null);
      return;
    }
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setGender(genderEnum);
    reportResultWithCallback(callback, null, result);
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
  public void setPushNotificationSubscriptionType(String subscriptionType, Callback callback) {
    NotificationSubscriptionType notificationSubscriptionType;
    if (subscriptionType == null) {
      reportResultWithCallback(callback, "Input subscription type was null. Push notification subscription type not set.", null);
      return;
    } else if (subscriptionType.equals("subscribed")) {
      notificationSubscriptionType = NotificationSubscriptionType.SUBSCRIBED;
    } else if (subscriptionType.equals("unsubscribed")) {
      notificationSubscriptionType = NotificationSubscriptionType.UNSUBSCRIBED;
    } else if (subscriptionType.equals("optedin")) {
      notificationSubscriptionType = NotificationSubscriptionType.OPTED_IN;
    } else {
      reportResultWithCallback(callback, "Invalid subscription type " + subscriptionType + ". Push notification subscription type not set.", null);
      return;
    }
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setPushNotificationSubscriptionType(notificationSubscriptionType);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void setEmailNotificationSubscriptionType(String subscriptionType, Callback callback) {
    NotificationSubscriptionType notificationSubscriptionType;
    if (subscriptionType == null) {
      reportResultWithCallback(callback, "Input subscription type was null. Email notification subscription type not set.", null);
      return;
    } else if (subscriptionType.equals("subscribed")) {
      notificationSubscriptionType = NotificationSubscriptionType.SUBSCRIBED;
    } else if (subscriptionType.equals("unsubscribed")) {
      notificationSubscriptionType = NotificationSubscriptionType.UNSUBSCRIBED;
    } else if (subscriptionType.equals("optedin")) {
      notificationSubscriptionType = NotificationSubscriptionType.OPTED_IN;
    } else {
      reportResultWithCallback(callback, "Invalid subscription type " + subscriptionType + ". Email notification subscription type not set.", null);
      return;
    }
    boolean result = Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setEmailNotificationSubscriptionType(notificationSubscriptionType);
    reportResultWithCallback(callback, null, result);
  }

  @ReactMethod
  public void setTwitterData(Integer id, String screenName, String name, String description, Integer followersCount, Integer friendsCount, Integer statusesCount, String profileImageUrl) {
    TwitterUser twitterUser = new TwitterUser(id, screenName, name, description, followersCount, friendsCount, statusesCount, profileImageUrl);
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setTwitterData(twitterUser);
  }

  @ReactMethod
  public void setFacebookData(ReadableMap facebookUserDictionary, Integer numberOfFriends, ReadableArray likes) {
    List<String> likesList = new ArrayList<String>();
    if (likes != null) {
      for (int i = 0; i < likes.size(); i++) {
        ReadableType readableType = likes.getType(i);
        if (readableType == ReadableType.String) {
          likesList.add(likes.getString(i));
        } else if (readableType == ReadableType.Map) {
          ReadableMap like = likes.getMap(i);
          String likeString = like.getString("name");
          if (likeString != null) {
            likesList.add(likeString);
          }
        }
      }
    }

    String facebookId = null;
    String firstName = null;
    String lastName = null;
    String email = null;
    String bio = null;
    String birthday = null;
    Gender genderEnum = null;
    String cityName = null;

    if (facebookUserDictionary != null) {
      facebookId = facebookUserDictionary.getString("id");
      firstName = facebookUserDictionary.getString("first_name");
      lastName = facebookUserDictionary.getString("last_name");
      email = facebookUserDictionary.getString("email");
      bio = facebookUserDictionary.getString("bio");
      birthday = facebookUserDictionary.getString("birthday");

      String genderString = facebookUserDictionary.getString("gender");
      if (genderString != null && genderString.length() > 0) {
        if (genderString.toUpperCase().startsWith("M")) {
          genderEnum = Gender.MALE;
        } else if (genderString.toUpperCase().startsWith("F")) {
          genderEnum = Gender.FEMALE;
        }
      }
      ReadableMap location = facebookUserDictionary.getMap("location");
      if (location != null) {
        cityName = location.getString("name");
      }
    }
    FacebookUser facebookUser = new FacebookUser(facebookId, firstName, lastName, email,
            bio, cityName, genderEnum, numberOfFriends, likesList, birthday);
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setFacebookData(facebookUser);
  }

  @ReactMethod
  public void launchNewsFeed() {
    Intent intent = new Intent(getCurrentActivity(), AppboyFeedActivity.class);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    this.getReactApplicationContext().startActivity(intent);
  }

  @ReactMethod
  public void requestFeedRefresh() {
    Appboy.getInstance(getReactApplicationContext()).requestFeedRefresh();
  }

  private CardCategory getCardCategoryFromString(String categoryString) {
    CardCategory cardCategory = null;
    for (CardCategory category : CardCategory.values()) {
      if (categoryString != null && categoryString.toUpperCase().equals(category.name())) {
        cardCategory = category;
      }
    }
    return cardCategory;
  }

  @ReactMethod
  public void getCardCountForCategories(String category, Callback callback) {
    if (lastFeedEvent == null) {
      reportResultWithCallback(callback, "Feed has not been loaded.", null);
    } else {
      if (ALL_CATEGORIES.equals(category)) {
        reportResultWithCallback(callback, null, feedUpdatedEvent.getCardCount());
      } else {
        final CardCategory cardCategory = getCardCategoryFromString(category);
        if (cardCategory != null) {
          reportResultWithCallback(callback, null, feedUpdatedEvent.getCardCount(cardCategory));
        } else {
          reportResultWithCallback(callback, "Invalid card category " + category + ", could not retrieve card count", null);
        }
      }
    }
  }

  @ReactMethod
  public void getUnreadCardCountForCategories(String category, Callback callback) {
    if (lastFeedEvent == null) {
      reportResultWithCallback(callback, "Feed has not been loaded.", null);
    } else {
      if (ALL_CATEGORIES.equals(category)) {
        reportResultWithCallback(callback, null, feedUpdatedEvent.getUnreadCardCount());
      } else {
        final CardCategory cardCategory = getCardCategoryFromString(category);
        if (cardCategory != null) {
          reportResultWithCallback(callback, null, feedUpdatedEvent.getUnreadCardCount(cardCategory));
        } else {
          reportResultWithCallback(callback, "Invalid card category " + category + ", could not retrieve unread card count", null);
        }
      }
    }
  }

  @ReactMethod
  public void getCardsInCategories(String category, Callback callback) {
    if (lastFeedEvent == null) {
      reportResultWithCallback(callback, "Feed has not been loaded.", null);
    } else {
      if (ALL_CATEGORIES.equals(category)) {
        reportResultWithCallback(callback, null, feedUpdatedEvent.getFeedCards());
      } else {
        final CardCategory cardCategory = getCardCategoryFromString(category);
        if (cardCategory != null) {
          reportResultWithCallback(callback, null, feedUpdatedEvent.getFeedCards(cardCategory));
        } else {
          reportResultWithCallback(callback, "Invalid card category " + category + ", could not retrieve unread card count", null);
        }
      }
    }
  }

  @ReactMethod
  public void logCardImpression(String cardId, Callback callback) {
    if (lastFeedEvent == null) {
      reportResultWithCallback(callback, "Feed has not been loaded.", null);
    } else if (cardId == null) {
      reportResultWithCallback(callback, "cardId cannot be null", null);
    } else {
      final Optional<Card> foundCard = lastFeedEvent.getFeedCards();
        .stream()
        .filter(card -> cardId.equals(card.getId()))
        .findFirst();
      if (foundCard.isPresent()) {
        foundCard.get().logImpression();
        reportResultWithCallback(callback, null, cardId);
      } else {
        reportResultWithCallback(callback, "No card found with ID " + cardId, null);
      }
    }
  }

  @ReactMethod
  public void logCardClicked(String cardId, Callback callback) {
    if (lastFeedEvent == null) {
      reportResultWithCallback(callback, "Feed has not been loaded.", null);
    } else if (cardId == null) {
      reportResultWithCallback(callback, "cardId cannot be null", null);
    } else {
      final Optional<Card> foundCard = lastFeedEvent.getFeedCards();
        .stream()
        .filter(card -> cardId.equals(card.getId()))
        .findFirst();
      if (foundCard.isPresent()) {
        foundCard.get().logClick();
        reportResultWithCallback(callback, null, cardId);
      } else {
        reportResultWithCallback(callback, "No card found with ID " + cardId, null);
      }
    }
  }

  @ReactMethod
  public void launchFeedback() {
    Log.i(TAG, "Launch feedback actions are not currently supported on Android. Doing nothing.");
  }

  @ReactMethod
  public void wipeData() {
    Appboy.wipeData(getReactApplicationContext());
  }

  @ReactMethod
  public void disableSDK() {
    Appboy.disableSdk(getReactApplicationContext());
  }

  @ReactMethod
  public void enableSDK() {
    Appboy.enableSdk(getReactApplicationContext());
  }

  @ReactMethod
  public void requestLocationInitialization() {
    AppboyLocationService.requestInitialization(getReactApplicationContext());
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
