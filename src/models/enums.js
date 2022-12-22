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

export const ContentCardTypes = {
  CLASSIC: 'Classic',
  BANNER: 'Banner',
  CAPTIONED: 'Captioned'
};

export const Events = {
  CONTENT_CARDS_UPDATED: 'contentCardsUpdated',
  FEED_CARDS_UPDATED: 'feedCardsUpdated',
  SDK_AUTHENTICATION_ERROR: 'sdkAuthenticationError',
  IN_APP_MESSAGE_RECEIVED: 'inAppMessageReceived',
  PUSH_NOTIFICATION_EVENT: 'pushNotificationEvent'
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
