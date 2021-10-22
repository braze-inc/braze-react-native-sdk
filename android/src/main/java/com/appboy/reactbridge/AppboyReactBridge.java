package com.appboy.reactbridge;

import android.content.Intent;

import androidx.annotation.NonNull;

import com.appboy.Appboy;
import com.appboy.enums.CardCategory;
import com.appboy.enums.Gender;
import com.appboy.enums.Month;
import com.appboy.enums.NotificationSubscriptionType;
import com.appboy.events.BrazeSdkAuthenticationErrorEvent;
import com.appboy.events.FeedUpdatedEvent;
import com.appboy.events.IEventSubscriber;
import com.appboy.events.SimpleValueCallback;
import com.appboy.models.cards.BannerImageCard;
import com.appboy.models.cards.CaptionedImageCard;
import com.appboy.models.cards.Card;
import com.appboy.models.cards.ShortNewsCard;
import com.appboy.models.cards.TextAnnouncementCard;
import com.appboy.models.outgoing.AppboyProperties;
import com.appboy.models.outgoing.AttributionData;
import com.appboy.models.outgoing.FacebookUser;
import com.appboy.models.outgoing.TwitterUser;
import com.appboy.support.AppboyLogger;
import com.appboy.ui.activities.AppboyContentCardsActivity;
import com.appboy.ui.activities.AppboyFeedActivity;
import com.braze.Braze;
import com.braze.BrazeUser;
import com.braze.events.ContentCardsUpdatedEvent;
import com.braze.models.inappmessage.IInAppMessage;
import com.braze.models.inappmessage.IInAppMessageImmersive;
import com.braze.models.inappmessage.MessageButton;
import com.braze.support.BrazeLogger;
import com.braze.ui.inappmessage.BrazeInAppMessageManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

public class AppboyReactBridge extends ReactContextBaseJavaModule {
  private static final String TAG = BrazeLogger.getBrazeLogTag(AppboyReactBridge.class);
  private static final String CARD_COUNT_TAG = "card count";
  private static final String UNREAD_CARD_COUNT_TAG = "unread card count";
  private static final String CONTENT_CARDS_UPDATED_EVENT_NAME = "contentCardsUpdated";
  private static final String SDK_AUTH_ERROR_EVENT_NAME = "sdkAuthenticationError";

  private final Object mCallbackWasCalledMapLock = new Object();
  private final List<Card> mContentCards = new ArrayList<>();
  private final Map<Callback, IEventSubscriber<FeedUpdatedEvent>> mFeedSubscriberMap = new ConcurrentHashMap<>();
  private final Map<Callback, Boolean> mCallbackWasCalledMap = new ConcurrentHashMap<>();
  private long mContentCardsUpdatedAt = 0;
  private IEventSubscriber<ContentCardsUpdatedEvent> mContentCardsUpdatedSubscriber;
  private IEventSubscriber<BrazeSdkAuthenticationErrorEvent> mSdkAuthErrorSubscriber;

  public AppboyReactBridge(ReactApplicationContext reactContext) {
    super(reactContext);
    subscribeToContentCardsUpdatedEvent();
    subscribeToSdkAuthenticationErrorEvents();
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

  @ReactMethod
  public void setSDKFlavor() {
    // Dummy method required for the iOS SDK flavor implementation; see AppboyReactBridge.setSDKFlavor()
    // in index.js. The Android bridge sets the REACT SDK flavor via a braze.xml parameter.
  }

  @ReactMethod
  public void requestImmediateDataFlush() {
    Braze.getInstance(getReactApplicationContext()).requestImmediateDataFlush();
  }

  @ReactMethod
  public void changeUser(String userName, String sdkAuthToken) {
    Braze.getInstance(getReactApplicationContext()).changeUser(userName, sdkAuthToken);
  }

  @ReactMethod
  public void addAlias(final String aliasName, final String aliasLabel) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.addAlias(aliasName, aliasLabel);
      }
    });
  }

  @ReactMethod
  public void pushAuthorizationFromUserNotificationCenter(boolean pushAuthGranted) {
    // Dummy method required for the iOS SDK flavor implementation; see AppboyReactBridge.pushAuthorizationFromUserNotificationCenter()
    // in index.js. The Android bridge does not need this.
  }

  @ReactMethod
  public void registerAndroidPushToken(String token) {
    Braze.getInstance(getReactApplicationContext()).registerAppboyPushMessages(token);
  }

  @ReactMethod
  public void setGoogleAdvertisingId(String googleAdvertisingId, Boolean adTrackingEnabled) {
    Braze.getInstance(getReactApplicationContext()).setGoogleAdvertisingId(googleAdvertisingId, adTrackingEnabled);
  }

  @ReactMethod
  public void logCustomEvent(String eventName, ReadableMap eventProperties) {
    if (eventProperties == null) {
      Braze.getInstance(getReactApplicationContext()).logCustomEvent(eventName);
    } else {
      Braze.getInstance(getReactApplicationContext()).logCustomEvent(eventName, populateEventPropertiesFromReadableMap(eventProperties));
    }
  }

  private AppboyProperties populateEventPropertiesFromReadableMap(ReadableMap eventProperties) {
    if (eventProperties == JSONObject.NULL) {
      return new AppboyProperties();
    }

    return new AppboyProperties(new JSONObject(parseReadableMap(eventProperties)));
  }

  private Map parseReadableMap(ReadableMap readableMap) {
    ReadableMapKeySetIterator keySetIterator = readableMap.keySetIterator();
    Map parsedMap = readableMap.toHashMap();
    while (keySetIterator.hasNextKey()) {
      String key = keySetIterator.nextKey();
      ReadableType readableType = readableMap.getType(key);
      if (readableType == readableType.Map) {
        if (readableMap.getMap(key).hasKey("type") &&
                readableMap.getMap(key).getString("type").equals("UNIX_timestamp")) {
          double unixTimestamp = readableMap.getMap(key).getDouble("value");
          parsedMap.put(key, new Date((long) unixTimestamp));
        } else {
          parsedMap.put(key, parseReadableMap(readableMap.getMap(key)));
        }
      } else if (readableType == readableType.Array) {
        parsedMap.put(key, parseReadableArray(readableMap.getArray(key)));
      }
    }
    return parsedMap;
  }

  private List parseReadableArray(ReadableArray readableArray) {
    List parsedList = readableArray.toArrayList();
    for (int i = 0; i < readableArray.size(); i++) {
      ReadableType readableType = readableArray.getType(i);
      if (readableType == readableType.Map) {
        if (readableArray.getMap(i).hasKey("type") &&
                readableArray.getMap(i).getString("type").equals("UNIX_timestamp")) {
          double unixTimestamp = readableArray.getMap(i).getDouble("value");
          parsedList.set(i, new Date((long) unixTimestamp));
        } else {
          parsedList.set(i, parseReadableMap(readableArray.getMap(i)));
        }
      } else if (readableType == readableType.Array) {
        parsedList.set(i, parseReadableArray(readableArray.getArray(i)));
      }
    }
    return parsedList;
  }

  @ReactMethod
  public void logPurchase(String productIdentifier, String price, String currencyCode, int quantity, ReadableMap eventProperties) {
    if (eventProperties == null) {
      Braze.getInstance(getReactApplicationContext()).logPurchase(productIdentifier, currencyCode, new BigDecimal(price), quantity);
    } else {
      Braze.getInstance(getReactApplicationContext()).logPurchase(productIdentifier, currencyCode, new BigDecimal(price), quantity, populateEventPropertiesFromReadableMap(eventProperties));
    }
  }

  @ReactMethod
  public void setStringCustomUserAttribute(final String key, final String value, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setCustomUserAttribute(key, value);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setBoolCustomUserAttribute(final String key, final Boolean value, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setCustomUserAttribute(key, value);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setIntCustomUserAttribute(final String key, final int value, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setCustomUserAttribute(key, value);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setDoubleCustomUserAttribute(final String key, final float value, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setCustomUserAttribute(key, value);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setDateCustomUserAttribute(final String key, final int timeStamp, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setCustomUserAttributeToSecondsFromEpoch(key, timeStamp);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void incrementCustomUserAttribute(final String key, final int incrementValue, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.incrementCustomUserAttribute(key, incrementValue);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void unsetCustomUserAttribute(final String key, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.unsetCustomUserAttribute(key);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setCustomUserAttributeArray(final String key, ReadableArray value, final Callback callback) {
    int size = value.size();
    final String[] attributeArray = new String[size];
    for (int i = 0; i < size; i++) {
      attributeArray[i] = value.getString(i);
    }
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setCustomAttributeArray(key, attributeArray);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void addToCustomAttributeArray(final String key, final String value, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.addToCustomAttributeArray(key, value);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void removeFromCustomAttributeArray(final String key, final String value, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.removeFromCustomAttributeArray(key, value);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setFirstName(final String firstName) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setFirstName(firstName);
      }
    });
  }

  @ReactMethod
  public void setLastName(final String lastName) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setLastName(lastName);
      }
    });
  }

  @ReactMethod
  public void setEmail(final String email) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setEmail(email);
      }
    });
  }

  @ReactMethod
  public void setGender(String gender, final Callback callback) {
    final Gender genderEnum;
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
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setGender(genderEnum);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setDateOfBirth(final int year, final int month, final int day) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setDateOfBirth(year, parseMonth(month), day);
      }
    });
  }

  @ReactMethod
  public void setCountry(final String country) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setCountry(country);
      }
    });
  }

  @ReactMethod
  public void setHomeCity(final String homeCity) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setHomeCity(homeCity);
      }
    });
  }

  @ReactMethod
  public void setPhoneNumber(final String phoneNumber) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setPhoneNumber(phoneNumber);
      }
    });
  }

  @ReactMethod
  public void setLanguage(final String language) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setLanguage(language);
      }
    });
  }

  @ReactMethod
  public void setAvatarImageUrl(final String avatarImageUrl) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setAvatarImageUrl(avatarImageUrl);
      }
    });
  }

  @ReactMethod
  public void addToSubscriptionGroup(String groupId, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.addToSubscriptionGroup(groupId);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void removeFromSubscriptionGroup(String groupId, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.removeFromSubscriptionGroup(groupId);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setPushNotificationSubscriptionType(String subscriptionType, final Callback callback) {
    final NotificationSubscriptionType notificationSubscriptionType;
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
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setPushNotificationSubscriptionType(notificationSubscriptionType);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setEmailNotificationSubscriptionType(String subscriptionType, final Callback callback) {
    final NotificationSubscriptionType notificationSubscriptionType;
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
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        boolean result = brazeUser.setEmailNotificationSubscriptionType(notificationSubscriptionType);
        reportResultWithCallback(callback, null, result);
      }
    });
  }

  @ReactMethod
  public void setTwitterData(Integer id,
                             String screenName,
                             String name,
                             String description,
                             Integer followersCount,
                             Integer friendsCount,
                             Integer statusesCount,
                             String profileImageUrl) {
    final TwitterUser twitterUser = new TwitterUser(id,
        screenName,
        name,
        description,
        followersCount,
        friendsCount,
        statusesCount,
        profileImageUrl);
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setTwitterData(twitterUser);
      }
    });
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
    final FacebookUser facebookUser = new FacebookUser(facebookId, firstName, lastName, email,
            bio, cityName, genderEnum, numberOfFriends, likesList, birthday);
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setFacebookData(facebookUser);
      }
    });
  }

  @ReactMethod
  public void launchNewsFeed() {
    Intent intent = new Intent(getCurrentActivity(), AppboyFeedActivity.class);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    this.getReactApplicationContext().startActivity(intent);
  }

  @ReactMethod
  public void launchContentCards() {
    Intent intent = new Intent(getCurrentActivity(), AppboyContentCardsActivity.class);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    this.getReactApplicationContext().startActivity(intent);
  }

  @ReactMethod
  public void requestContentCardsRefresh() {
    Braze.getInstance(getReactApplicationContext()).requestContentCardsRefresh(false);
  }

  @ReactMethod
  public void getContentCards(final Promise promise) {
    final IEventSubscriber<ContentCardsUpdatedEvent> subscriber = new IEventSubscriber<ContentCardsUpdatedEvent>() {
      @Override
      public void trigger(ContentCardsUpdatedEvent event) {
        promise.resolve(mapContentCards(event.getAllCards()));
        updateContentCardsIfNeeded(event);
        Braze.getInstance(getReactApplicationContext()).removeSingleSubscription(this, ContentCardsUpdatedEvent.class);
      }
    };
    Braze.getInstance(getReactApplicationContext()).subscribeToContentCardsUpdates(subscriber);
    Braze.getInstance(getReactApplicationContext()).requestContentCardsRefresh(true);
  }

  @ReactMethod
  public void setSdkAuthenticationSignature(String token) {
    Braze.getInstance(getReactApplicationContext()).setSdkAuthenticationSignature(token);
  }

  private WritableArray mapContentCards(List<Card> cardsList) {
    WritableArray cards = Arguments.createArray();
    for (Card card : cardsList.toArray(new Card[0])) {
      cards.pushMap(mapContentCard(card));
    }
    return cards;
  }

  private WritableMap mapContentCard(Card card) {
    WritableMap mappedCard = Arguments.createMap();
    mappedCard.putString("id", card.getId());
    mappedCard.putDouble("created", card.getCreated());
    mappedCard.putDouble("expiresAt", card.getExpiresAt());
    mappedCard.putBoolean("viewed", card.getViewed());
    mappedCard.putBoolean("clicked", card.isClicked());
    mappedCard.putBoolean("pinned", card.getIsPinned());
    mappedCard.putBoolean("dismissed", card.isDismissed());
    mappedCard.putBoolean("dismissible", card.getIsDismissibleByUser());
    mappedCard.putString("url", card.getUrl());
    mappedCard.putBoolean("openURLInWebView", card.getOpenUriInWebView());

    // Extras
    WritableMap extras = Arguments.createMap();
    for (Map.Entry<String, String> entry : card.getExtras().entrySet()) {
      extras.putString(entry.getKey(), entry.getValue());
    }
    mappedCard.putMap("extras", extras);

    // Map according to card type
    switch (card.getCardType()) {
      case BANNER:
        mappedCard.merge(bannerImageCardToWritableMap((BannerImageCard) card));
        break;
      case CAPTIONED_IMAGE:
        mappedCard.merge(captionedImageCardToWritableMap((CaptionedImageCard)card));
        break;
      case SHORT_NEWS:
        mappedCard.merge(shortNewsCardToWritableMap((ShortNewsCard)card));
        break;
      case TEXT_ANNOUNCEMENT:
        mappedCard.merge(textAnnouncementCardToWritableMap((TextAnnouncementCard)card));
        break;
      case DEFAULT:
      case CONTROL:
        break;
    }

    return mappedCard;
  }

  private WritableMap captionedImageCardToWritableMap(CaptionedImageCard card) {
    WritableMap mappedCard = Arguments.createMap();
    mappedCard.putString("image", card.getImageUrl());
    mappedCard.putDouble("imageAspectRatio", card.getAspectRatio());
    mappedCard.putString("title", card.getTitle());
    mappedCard.putString("cardDescription", card.getDescription());
    mappedCard.putString("domain", card.getDomain());
    mappedCard.putString("type", "Captioned");
    return mappedCard;
  }

  private WritableMap shortNewsCardToWritableMap(ShortNewsCard card) {
    WritableMap mappedCard = Arguments.createMap();
    mappedCard.putString("image", card.getImageUrl());
    mappedCard.putString("title", card.getTitle());
    mappedCard.putString("cardDescription", card.getDescription());
    mappedCard.putString("domain", card.getDomain());
    mappedCard.putString("type", "Classic");
    return mappedCard;
  }

  private WritableMap textAnnouncementCardToWritableMap(TextAnnouncementCard card) {
    WritableMap mappedCard = Arguments.createMap();
    mappedCard.putString("title", card.getTitle());
    mappedCard.putString("cardDescription", card.getDescription());
    mappedCard.putString("domain", card.getDomain());
    mappedCard.putString("type", "Classic");
    return mappedCard;
  }

  private WritableMap bannerImageCardToWritableMap(BannerImageCard card) {
    WritableMap mappedCard = Arguments.createMap();
    mappedCard.putString("image", card.getImageUrl());
    mappedCard.putDouble("imageAspectRatio", card.getAspectRatio());
    mappedCard.putString("domain", card.getDomain());
    mappedCard.putString("type", "Banner");
    return mappedCard;
  }

  private void subscribeToContentCardsUpdatedEvent() {
    Braze.getInstance(getReactApplicationContext())
            .removeSingleSubscription(mContentCardsUpdatedSubscriber, ContentCardsUpdatedEvent.class);
    mContentCardsUpdatedSubscriber = new IEventSubscriber<ContentCardsUpdatedEvent>() {
      @Override
      public void trigger(ContentCardsUpdatedEvent event) {
        boolean updated = event.getLastUpdatedInSecondsFromEpoch() > mContentCardsUpdatedAt;
        if (updated && getReactApplicationContext().hasActiveCatalystInstance()) {
          getReactApplicationContext()
                  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                  .emit(CONTENT_CARDS_UPDATED_EVENT_NAME, updated);
        }
        updateContentCardsIfNeeded(event);
      }
    };
    Braze.getInstance(getReactApplicationContext()).subscribeToContentCardsUpdates(mContentCardsUpdatedSubscriber);
  }

  private void subscribeToSdkAuthenticationErrorEvents() {
    Braze.getInstance(getReactApplicationContext()).removeSingleSubscription(mSdkAuthErrorSubscriber, BrazeSdkAuthenticationErrorEvent.class);
    mSdkAuthErrorSubscriber = new IEventSubscriber<BrazeSdkAuthenticationErrorEvent>() {
      @Override
      public void trigger(BrazeSdkAuthenticationErrorEvent errorEvent) {
        if (!getReactApplicationContext().hasActiveCatalystInstance()) {
          return;
        }
        final WritableNativeMap data = new WritableNativeMap();
        data.putInt("error_code", errorEvent.getErrorCode());
        data.putString("user_id", errorEvent.getUserId());
        data.putString("original_signature", errorEvent.getSignature());
        data.putString("error_reason", errorEvent.getErrorReason());

        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(SDK_AUTH_ERROR_EVENT_NAME, data);
      }
    };
    Braze.getInstance(getReactApplicationContext()).subscribeToSdkAuthenticationFailures(mSdkAuthErrorSubscriber);
  }

  private void updateContentCardsIfNeeded(ContentCardsUpdatedEvent event) {
    if (event.getLastUpdatedInSecondsFromEpoch() > mContentCardsUpdatedAt) {
      mContentCardsUpdatedAt = event.getLastUpdatedInSecondsFromEpoch();
      mContentCards.clear();
      mContentCards.addAll(event.getAllCards());
    }
  }

  @ReactMethod
  private void logContentCardsDisplayed() {
    Braze.getInstance(getReactApplicationContext()).logContentCardsDisplayed();
  }

  @ReactMethod
  private void logContentCardDismissed(String id) {
    Card card = getCardById(id);
    if (card != null) {
      card.setIsDismissed(true);
    }
  }

  @ReactMethod
  private void logContentCardClicked(String id) {
    Card card = getCardById(id);
    if (card != null) {
      card.logClick();
    }
  }

  @ReactMethod
  private void logContentCardImpression(String id) {
    Card card = getCardById(id);
    if (card != null) {
      card.logImpression();
    }
  }

  private Card getCardById(String id) {
    for (Card card : mContentCards) {
      if (card.getId().equals(id)) {
        return card;
      }
    }
    return null;
  }

  @ReactMethod
  public void requestFeedRefresh() {
    Braze.getInstance(getReactApplicationContext()).requestFeedRefresh();
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

  // Registers a short-lived FeedUpdatedEvent subscriber, requests a feed refresh from cache, and and returns the requested card count in the callback
  private void getCardCountForTag(final String category, final Callback callback, String cardCountTag) {
    final CardCategory cardCategory = getCardCategoryFromString(category);
    // Note that Android does not have a CardCategory.ALL enum, while iOS does
    if (category == null || (cardCategory == null && !category.equals("all"))) {
      reportResultWithCallback(callback, "Invalid card category " + category + ", could not retrieve" + cardCountTag, null);
      return;
    }

    // Register FeedUpdatedEvent subscriber
    IEventSubscriber<FeedUpdatedEvent> feedUpdatedSubscriber = null;
    boolean requestingFeedUpdateFromCache = false;

    switch (cardCountTag) {
      case CARD_COUNT_TAG:
        // getCardCount
        feedUpdatedSubscriber = new IEventSubscriber<FeedUpdatedEvent>() {
          @Override
          public void trigger(FeedUpdatedEvent feedUpdatedEvent) {
            // Callback blocks (error or result) may only be invoked once, else React Native throws an error.
            synchronized (mCallbackWasCalledMapLock) {
              if (mCallbackWasCalledMap.get(callback) == null || mCallbackWasCalledMap.get(callback) != null && !mCallbackWasCalledMap.get(callback).booleanValue()) {
                mCallbackWasCalledMap.put(callback, new Boolean(true));
                if (category.equals("all")) {
                  reportResultWithCallback(callback, null, feedUpdatedEvent.getCardCount());
                } else {
                  reportResultWithCallback(callback, null, feedUpdatedEvent.getCardCount(cardCategory));
                }
              }
            }
            // Remove this listener from the feed subscriber map and from Appboy
            Braze.getInstance(getReactApplicationContext()).removeSingleSubscription(mFeedSubscriberMap.get(callback), FeedUpdatedEvent.class);
            mFeedSubscriberMap.remove(callback);
          }
        };
        requestingFeedUpdateFromCache = true;
        break;
      case UNREAD_CARD_COUNT_TAG:
        // getUnreadCardCount
        feedUpdatedSubscriber = new IEventSubscriber<FeedUpdatedEvent>() {
          @Override
          public void trigger(FeedUpdatedEvent feedUpdatedEvent) {
            // Callback blocks (error or result) may only be invoked once, else React Native throws an error.
            synchronized (mCallbackWasCalledMapLock) {
              if (mCallbackWasCalledMap.get(callback) == null || mCallbackWasCalledMap.get(callback) != null && !mCallbackWasCalledMap.get(callback).booleanValue()) {
                mCallbackWasCalledMap.put(callback, new Boolean(true));
                if (category.equals("all")) {
                  reportResultWithCallback(callback, null, feedUpdatedEvent.getUnreadCardCount());
                } else {
                  reportResultWithCallback(callback, null, feedUpdatedEvent.getUnreadCardCount(cardCategory));
                }
              }
            }
            // Remove this listener from the feed subscriber map and from Appboy
            Braze.getInstance(getReactApplicationContext()).removeSingleSubscription(mFeedSubscriberMap.get(callback), FeedUpdatedEvent.class);
            mFeedSubscriberMap.remove(callback);
          }
        };
        requestingFeedUpdateFromCache = true;
        break;
    }

    if (requestingFeedUpdateFromCache) {
      // Put the subscriber into a map so we can remove it later from future subscriptions
      mFeedSubscriberMap.put(callback, feedUpdatedSubscriber);
      Braze.getInstance(getReactApplicationContext()).subscribeToFeedUpdates(feedUpdatedSubscriber);
      Braze.getInstance(getReactApplicationContext()).requestFeedRefreshFromCache();
    }
  }

  @ReactMethod
  public void getCardCountForCategories(String category, Callback callback) {
    getCardCountForTag(category, callback, CARD_COUNT_TAG);
  }

  @ReactMethod
  public void getUnreadCardCountForCategories(String category, Callback callback) {
    getCardCountForTag(category, callback, UNREAD_CARD_COUNT_TAG);
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
    Braze.getInstance(getReactApplicationContext()).requestLocationInitialization();
  }

  @ReactMethod
  public void requestGeofences(Double latitude, Double longitude) {
    Braze.getInstance(getReactApplicationContext()).requestGeofences(latitude, longitude);
  }

  @ReactMethod
  public void setLocationCustomAttribute(final String key, final Double latitude, final Double longitude, final Callback callback) {
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setLocationCustomAttribute(key, latitude, longitude);
        // Always return true as Android doesn't support getting a result from setLocationCustomAttribute().
        reportResultWithCallback(callback, null, true);
      }
    });
  }

  @ReactMethod
  public void hideCurrentInAppMessage() {
    BrazeInAppMessageManager.getInstance().hideCurrentlyDisplayingInAppMessage(true);
  }

  @ReactMethod
  public void logInAppMessageClicked(String inAppMessageString) {
    IInAppMessage inAppMessage = Braze.getInstance(getReactApplicationContext()).deserializeInAppMessageString(inAppMessageString);
    if (inAppMessage != null) {
      inAppMessage.logClick();
    }
  }

  @ReactMethod
  public void logInAppMessageImpression(String inAppMessageString) {
    IInAppMessage inAppMessage = Braze.getInstance(getReactApplicationContext()).deserializeInAppMessageString(inAppMessageString);
    if (inAppMessage != null) {
      inAppMessage.logImpression();
    }
  }

  @ReactMethod
  public void logInAppMessageButtonClicked(String inAppMessageString, Integer buttonId) {
    IInAppMessage inAppMessage = Braze.getInstance(getReactApplicationContext()).deserializeInAppMessageString(inAppMessageString);
    if (inAppMessage instanceof IInAppMessageImmersive) {
      IInAppMessageImmersive inAppMessageImmersive = (IInAppMessageImmersive)inAppMessage;
      for (MessageButton button : inAppMessageImmersive.getMessageButtons()) {
        if (button.getId() == buttonId) {
          inAppMessageImmersive.logButtonClick(button);
          break;
        }
      }
    }
  }

  @ReactMethod
  public void setAttributionData(String network, String campaign, String adGroup, String creative) {
    final AttributionData attributionData = new AttributionData(network, campaign, adGroup, creative);
    Braze.getInstance(getReactApplicationContext()).getCurrentUser(new SimpleValueCallback<BrazeUser>() {
      @Override
      public void onSuccess(@NonNull BrazeUser brazeUser) {
        brazeUser.setAttributionData(attributionData);
      }
    });
  }

  @ReactMethod
  public void getInstallTrackingId(Callback callback) {
    reportResultWithCallback(callback, null, Braze.getInstance(getReactApplicationContext()).getInstallTrackingId());
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
