package com.appboy.reactbridge;

import android.content.Intent;
import android.support.annotation.Nullable;
import android.util.Log;

import com.appboy.Appboy;
import com.appboy.enums.Gender;
import com.appboy.enums.Month;
import com.appboy.enums.NotificationSubscriptionType;
import com.appboy.enums.CardCategory;
import com.appboy.events.ContentCardsUpdatedEvent;
import com.appboy.events.FeedUpdatedEvent;
import com.appboy.events.IEventSubscriber;
import com.appboy.models.cards.BannerImageCard;
import com.appboy.models.cards.CaptionedImageCard;
import com.appboy.models.cards.Card;
import com.appboy.models.cards.ShortNewsCard;
import com.appboy.models.cards.TextAnnouncementCard;
import com.appboy.models.outgoing.AppboyProperties;
import com.appboy.models.outgoing.AttributionData;
import com.appboy.models.outgoing.FacebookUser;
import com.appboy.models.outgoing.TwitterUser;
import com.appboy.services.AppboyLocationService;
import com.appboy.support.AppboyLogger;
import com.appboy.ui.activities.AppboyContentCardsActivity;
import com.appboy.ui.activities.AppboyFeedActivity;
import com.appboy.ui.inappmessage.AppboyInAppMessageManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.lang.Integer;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class AppboyReactBridge extends ReactContextBaseJavaModule {
  private static final String TAG = String.format("Appboy.%s", AppboyReactBridge.class.getName());
  private static final String CARD_COUNT_TAG = "card count";
  private static final String UNREAD_CARD_COUNT_TAG = "unread card count";
  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";
  private static final String CONTENT_CARDS_UPDATED_EVENT_NAME = "contentCardsUpdated";
  private final Object mCallbackWasCalledMapLock = new Object();
  private IEventSubscriber<ContentCardsUpdatedEvent> mContentCardsUpdatedSubscriber;
  private final List<Card> mContentCards = new ArrayList<>();
  private long mContentCardsUpdatedAt = 0;
  private Map<Callback, IEventSubscriber<FeedUpdatedEvent>> mFeedSubscriberMap = new ConcurrentHashMap<Callback, IEventSubscriber<FeedUpdatedEvent>>();
  private Map<Callback, Boolean> mCallbackWasCalledMap = new ConcurrentHashMap<Callback, Boolean>();

  public AppboyReactBridge(ReactApplicationContext reactContext) {
    super(reactContext);
    subscribeToContentCardsUpdatedEvent();
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
  public void addAlias(String aliasName, String aliasLabel) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().addAlias(aliasName, aliasLabel);
  }

  @ReactMethod
  public void registerAndroidPushToken(String token) {
    Appboy.getInstance(getReactApplicationContext()).registerAppboyPushMessages(token);
  }

  @ReactMethod
  public void logCustomEvent(String eventName, ReadableMap eventProperties) {
    if (eventProperties == null) {
      Appboy.getInstance(getReactApplicationContext()).logCustomEvent(eventName);
    } else {
      Appboy.getInstance(getReactApplicationContext()).logCustomEvent(eventName, populateEventPropertiesFromReadableMap(eventProperties));
    }
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
              AppboyLogger.e(TAG, "Could not parse ReadableType.Number from ReadableMap for key: " + key);
            }
          }
        } else if (readableType == ReadableType.Map) {
          try {
            if (eventProperties.getMap(key).getString("type").equals("UNIX_timestamp")) {
              double unixTimestamp = eventProperties.getMap(key).getDouble("value");
              properties.addProperty(key, new Date((long)unixTimestamp));
            } else {
              AppboyLogger.e(TAG, "Unsupported ReadableMap type received for key: " + key);
            }
          } catch (Exception e) {
            AppboyLogger.e(TAG, "Could not determine type from ReadableMap for key: " + key);
          }
        } else {
          AppboyLogger.e(TAG, "Could not map ReadableType to an AppboyProperty value for key: " + key);
        }
      }
    }
    return properties;
  }

  @ReactMethod
  public void logPurchase(String productIdentifier, String price, String currencyCode, int quantity, ReadableMap eventProperties) {
    if (eventProperties == null) {
      Appboy.getInstance(getReactApplicationContext()).logPurchase(productIdentifier, currencyCode, new BigDecimal(price), quantity);
    } else {
      Appboy.getInstance(getReactApplicationContext()).logPurchase(productIdentifier, currencyCode, new BigDecimal(price), quantity, populateEventPropertiesFromReadableMap(eventProperties));
    }
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
  public void setLanguage(String language) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setLanguage(language);
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
  public void launchContentCards() {
    Intent intent = new Intent(getCurrentActivity(), AppboyContentCardsActivity.class);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    this.getReactApplicationContext().startActivity(intent);
  }

  @ReactMethod
  public void requestContentCardsRefresh() {
    Appboy.getInstance(getReactApplicationContext()).requestContentCardsRefresh(false);
  }

  @ReactMethod
  public void getContentCards(final Promise promise) {
    final IEventSubscriber<ContentCardsUpdatedEvent> subscriber = new IEventSubscriber<ContentCardsUpdatedEvent>() {
      @Override
      public void trigger(ContentCardsUpdatedEvent event) {
        promise.resolve(mapContentCards(event.getAllCards()));
        updateContentCardsIfNeeded(event);
        Appboy.getInstance(getReactApplicationContext()).removeSingleSubscription(this, ContentCardsUpdatedEvent.class);
      }
    };
    Appboy.getInstance(getReactApplicationContext()).subscribeToContentCardsUpdates(subscriber);
    Appboy.getInstance(getReactApplicationContext()).requestContentCardsRefresh(true);
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
    mappedCard.putBoolean("dismissible", card.getIsDismissible());
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
      case DEFAULT:
        break;
      case SHORT_NEWS:
        mappedCard.merge(shortNewsCardToWritableMap((ShortNewsCard)card));
        break;
      case TEXT_ANNOUNCEMENT:
        mappedCard.merge(textAnnouncementCardToWritableMap((TextAnnouncementCard)card));
        break;
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
    Appboy.getInstance(getReactApplicationContext())
            .removeSingleSubscription(mContentCardsUpdatedSubscriber, ContentCardsUpdatedEvent.class);
    mContentCardsUpdatedSubscriber = new IEventSubscriber<ContentCardsUpdatedEvent>() {
      @Override
      public void trigger(ContentCardsUpdatedEvent event) {
        boolean updated = event.getLastUpdatedInSecondsFromEpoch() > mContentCardsUpdatedAt;
        if (updated) {
          getReactApplicationContext()
                  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                  .emit(CONTENT_CARDS_UPDATED_EVENT_NAME, updated);
        }
        updateContentCardsIfNeeded(event);
      }
    };
    Appboy.getInstance(getReactApplicationContext()).subscribeToContentCardsUpdates(mContentCardsUpdatedSubscriber);
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
    Appboy.getInstance(getReactApplicationContext()).logContentCardsDisplayed();
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

  private @Nullable Card getCardById(String id) {
    for (Card card : mContentCards) {
      if (card.getId().equals(id)) {
        return card;
      }
    }
    return null;
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

    if (cardCountTag.equals(CARD_COUNT_TAG)) {
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
          Appboy.getInstance(getReactApplicationContext()).removeSingleSubscription(mFeedSubscriberMap.get(callback), FeedUpdatedEvent.class);
          mFeedSubscriberMap.remove(callback);
        }
      };
      requestingFeedUpdateFromCache = true;
    } else if (cardCountTag.equals(UNREAD_CARD_COUNT_TAG)) {
      // getUnreadCardCount
      feedUpdatedSubscriber = new IEventSubscriber<FeedUpdatedEvent>() {
        @Override
        public void trigger(FeedUpdatedEvent feedUpdatedEvent) {
          // Callback blocks (error or result) may only be invoked once, else React Native throws an error.
          synchronized (mCallbackWasCalledMapLock) {
            if (mCallbackWasCalledMap.get(callback) == null || mCallbackWasCalledMap.get(callback)!= null && !mCallbackWasCalledMap.get(callback).booleanValue()) {
              mCallbackWasCalledMap.put(callback, new Boolean(true));
              if (category.equals("all")) {
                reportResultWithCallback(callback, null, feedUpdatedEvent.getUnreadCardCount());
              } else {
                reportResultWithCallback(callback, null, feedUpdatedEvent.getUnreadCardCount(cardCategory));
              }
            }
          }
          // Remove this listener from the feed subscriber map and from Appboy
          Appboy.getInstance(getReactApplicationContext()).removeSingleSubscription(mFeedSubscriberMap.get(callback), FeedUpdatedEvent.class);
          mFeedSubscriberMap.remove(callback);
        }
      };
      requestingFeedUpdateFromCache = true;
    }

    if (requestingFeedUpdateFromCache) {
      // Put the subscriber into a map so we can remove it later from future subscriptions
      mFeedSubscriberMap.put(callback, feedUpdatedSubscriber);
      Appboy.getInstance(getReactApplicationContext()).subscribeToFeedUpdates(feedUpdatedSubscriber);
      Appboy.getInstance(getReactApplicationContext()).requestFeedRefreshFromCache();
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
    AppboyLocationService.requestInitialization(getReactApplicationContext());
  }

  @ReactMethod
  public void setLocationCustomAttribute(String key, Double latitude, Double longitude, Callback callback) {
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setLocationCustomAttribute(key, latitude, longitude);
    // Always return true as Android doesn't support getting a result from setLocationCustomAttribute().
    reportResultWithCallback(callback, null, true);
  }

  @ReactMethod
  public void hideCurrentInAppMessage() {
    AppboyInAppMessageManager.getInstance().hideCurrentlyDisplayingInAppMessage(true);
  }

  @ReactMethod
  public void setAttributionData(String network, String campaign, String adGroup, String creative) {
    AttributionData attributionData = new AttributionData(network, campaign, adGroup, creative);
    Appboy.getInstance(getReactApplicationContext()).getCurrentUser().setAttributionData(attributionData);
  }

  @ReactMethod
  public void getInstallTrackingId(Callback callback) {
    reportResultWithCallback(callback, null, Appboy.getInstance(getReactApplicationContext()).getInstallTrackingId());
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
