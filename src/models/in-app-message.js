import { Button } from './button';
import { ClickAction, DismissType, MessageType } from './enums';

export class InAppMessage {
  constructor(data) {
    let inAppMessageJson = JSON.parse(data);
    this.inAppMessageJsonString = data;

    let messageJson = inAppMessageJson['message'];
    this.message = typeof messageJson === 'string' ? messageJson : '';

    let headerJson = inAppMessageJson['header'];
    this.header = typeof headerJson === 'string' ? headerJson : '';

    let uriJson = inAppMessageJson['uri'];
    this.uri = typeof uriJson === 'string' ? uriJson : '';

    let imageUrlJson = inAppMessageJson['image_url'];
    this.imageUrl = typeof imageUrlJson === 'string' ? imageUrlJson : '';

    let zippedAssetsUrlJson = inAppMessageJson['zipped_assets_url'];
    this.zippedAssetsUrl =
      typeof zippedAssetsUrlJson === 'string' ? zippedAssetsUrlJson : '';

    let useWebViewJson = inAppMessageJson['use_webview'];
    this.useWebView =
      typeof useWebViewJson === 'boolean' ? useWebViewJson : false;

    let durationJson = inAppMessageJson['duration'];
    this.duration = typeof durationJson === 'number' ? durationJson : 5;

    const isTestSendJson = inAppMessageJson['is_test_send'];
    this.isTestSend =
      typeof isTestSendJson === 'boolean' ? isTestSendJson : false;

    const imageAltTextJson = inAppMessageJson['image_alt'];
    if (typeof imageAltTextJson === 'string') {
      this.imageAltText = imageAltTextJson;
    }

    const languageJson = inAppMessageJson['language'];
    if (typeof languageJson === 'string') {
      this.language = languageJson;
    }

    let clickActionJson = inAppMessageJson['click_action'];
    this.clickAction = ClickAction['NONE'];
    if (typeof clickActionJson === 'string') {
      Object.values(ClickAction).forEach((action) => {
        if (action.toLowerCase().endsWith(clickActionJson.toLowerCase())) {
          this.clickAction = action;
        }
      });
    }

    let dismissTypeJson = inAppMessageJson['message_close'];
    this.dismissType = DismissType['AUTO_DISMISS'];
    if (typeof dismissTypeJson === 'string') {
      Object.values(DismissType).forEach((type) => {
        if (type.toLowerCase().endsWith(dismissTypeJson.toLowerCase())) {
          this.dismissType = type;
        }
      });
    }

    let messageTypeJson = inAppMessageJson['type'];
    this.messageType = MessageType['SLIDEUP'];
    if (typeof messageTypeJson === 'string') {
      Object.values(MessageType).forEach((type) => {
        if (type.toLowerCase().endsWith(messageTypeJson.toLowerCase())) {
          this.messageType = type;
        }
      });
    }

    let extrasJson = inAppMessageJson['extras'];
    this.extras = {};
    if (typeof extrasJson === 'object') {
      Object.keys(extrasJson).forEach((key) => {
        if (typeof extrasJson[key] === 'string') {
          this.extras[key] = extrasJson[key];
        }
      });
    }

    this.buttons = [];
    let buttonsJson = inAppMessageJson['btns'];
    if (typeof buttonsJson === 'object' && Array.isArray(buttonsJson)) {
      buttonsJson.forEach((buttonJson) => {
        this.buttons.push(new Button(buttonJson));
      });
    }
  }

  toString() {
    return (
      `BrazeInAppMessage:` +
      `\n  message: ${this.message}` +
      `\n  header: ${this.header}` +
      `\n  uri: ${this.uri}` +
      `\n  imageUrl: ${this.imageUrl}` +
      `\n  imageAltText: ${this.imageAltText}` +
      `\n  language: ${this.language}` +
      `\n  zippedAssetsUrl: ${this.zippedAssetsUrl}` +
      `\n  useWebView: ${this.useWebView}` +
      `\n  duration: ${this.duration}` +
      `\n  clickAction: ${this.clickAction}` +
      `\n  dismissType: ${this.dismissType}` +
      `\n  messageType: ${this.messageType}` +
      `\n  extras: ${JSON.stringify(this.extras)}` +
      `\n  buttons: [${this.buttons.map((b) => b.toString()).join(', ')}]` +
      `\n  isTestSend: ${this.isTestSend}`
    );
  }
}
