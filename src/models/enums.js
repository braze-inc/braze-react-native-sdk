// Enums
export const CardCategory = {
  ADVERTISING: 'advertising',
  ANNOUNCEMENTS: 'announcements',
  NEWS: 'news',
  SOCIAL: 'social',
  NO_CATEGORY: 'no_category',
  ALL: 'all'
};

export const NotificationSubscriptionTypes = {
  OPTED_IN: 'optedin',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed'
};

export const Genders = {
  FEMALE: 'f',
  MALE: 'm',
  NOT_APPLICABLE: 'n',
  OTHER: 'o',
  PREFER_NOT_TO_SAY: 'p',
  UNKNOWN: 'u'
};

export const TrackingProperty = {
  ALL_CUSTOM_ATTRIBUTES: 'all_custom_attributes',
  ALL_CUSTOM_EVENTS: 'all_custom_events',
  ANALYTICS_EVENTS: 'analytics_events',
  ATTRIBUTION_DATA: 'attribution_data',
  COUNTRY: 'country',
  CUSTOM_ATTRIBUTE: 'custom_attribute',
  CUSTOM_EVENT: 'custom_event',
  DATE_OF_BIRTH: 'dob',
  DEVICE_DATA: 'device_data',
  EMAIL: 'email',
  EMAIL_SUBSCRIPTION_STATE: 'email_subscription_state',
  EVERYTHING: 'everything',
  FIRST_NAME: 'first_name',
  GENDER: 'gender',
  HOME_CITY: 'home_city',
  LANGUAGE: 'language',
  LAST_NAME: 'last_name',
  NOTIFICATION_SUBSCRIPTION_STATE: 'notification_subscription_state',
  PHONE_NUMBER: 'phone_number',
  PUSH_TOKEN: 'push_token',
};

export const ContentCardTypes = {
  CLASSIC: 'Classic',
  IMAGE_ONLY: 'ImageOnly',
  CAPTIONED: 'Captioned'
};

export const Events = {
  CONTENT_CARDS_UPDATED: 'contentCardsUpdated',
  NEWS_FEED_CARDS_UPDATED: 'newsFeedCardsUpdated',
  SDK_AUTHENTICATION_ERROR: 'sdkAuthenticationError',
  IN_APP_MESSAGE_RECEIVED: 'inAppMessageReceived',
  PUSH_NOTIFICATION_EVENT: 'pushNotificationEvent',
  FEATURE_FLAGS_UPDATED: 'featureFlagsUpdated',
};

export const ClickAction = {
  NEWS_FEED: 'news_feed',
  URI: 'uri',
  NONE: 'none'
};

export const DismissType = {
  SWIPE: 'swipe',
  AUTO_DISMISS: 'auto_dismiss'
};

export const MessageType = {
  SLIDEUP: 'slideup',
  MODAL: 'modal',
  FULL: 'full',
  HTML_FULL: 'html_full'
};
