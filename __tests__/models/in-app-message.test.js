import Braze from '../../src/index';
const NativeBrazeReactModule = require('../../src/specs/NativeBrazeReactModule').default;

const testInAppMessageJson = `{\"message\":\"body body\",\"type\":\"MODAL\",\"text_align_message\":\"CENTER\",\"click_action\":\"NONE\",\"message_close\":\"SWIPE\",\"extras\":{\"test\":\"123\",\"foo\":\"bar\"},\"header\":\"hello\",\"text_align_header\":\"CENTER\",\"image_url\":\"https:\\/\\/github.com\\/braze-inc\\/braze-react-native-sdk\\/blob\\/master\\/.github\\/assets\\/logo-dark.png?raw=true\",\"image_style\":\"TOP\",\"btns\":[{\"id\":0,\"text\":\"button 1\",\"click_action\":\"URI\",\"uri\":\"https:\\/\\/www.google.com\",\"use_webview\":true,\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479},{\"id\":1,\"text\":\"button 2\",\"click_action\":\"NONE\",\"bg_color\":4279990479,\"text_color\":4294967295,\"border_color\":4279990479}],\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\", \"is_test_send\":false}`;

afterEach(() => {
  jest.clearAllMocks();
});

describe('BrazeInAppMessage', () => {
  it('instantiates a BrazeInAppMessage object', () => {
    const testMessageBody = "some message body";
    const testMessageType = 'MODAL';
    const testUri = "https:\\/\\/www.sometesturi.com";
    const testImageUrl = "https:\\/\\/www.sometestimageuri.com";
    const testZippedAssetsUrl = "https:\\/\\/www.sometestzippedassets.com";
    const testUseWebView = true;
    const testDuration = 42;
    const testExtras = '{\"test\":\"123\",\"foo\":\"bar\"}';
    const testClickAction = 'URI';
    const testDismissType = 'SWIPE';
    const testHeader = "some header";
    const testButton0 = '{\"id\":0,\"text\":\"button 1\",\"click_action\":\"URI\",\"uri\":\"https:\\/\\/www.google.com\",\"use_webview\":true,\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479}';
    const testButton1 = '{\"id\":1,\"text\":\"button 2\",\"click_action\":\"NONE\",\"bg_color\":4279990479,\"text_color\":4294967295,\"border_color\":4279990479}';
    const testButtonString = `[${testButton0}, ${testButton1}]`;
    const testButtons = [];
    const testIsTestSend = true;
    const testImageAltText = "hola me llamo braze";
    const testLanguage = "es";
    testButtons.push(new Braze.BrazeButton(JSON.parse(testButton0)));
    testButtons.push(new Braze.BrazeButton(JSON.parse(testButton1)));
    const testJson = `{\"message\":\"${testMessageBody}\",\"type\":\"${testMessageType}\",\"text_align_message\":\"CENTER\",\"click_action\":\"${testClickAction}\",\"message_close\":\"SWIPE\",\"extras\":${testExtras},\"header\":\"${testHeader}\",\"text_align_header\":\"CENTER\",\"image_url\":\"${testImageUrl}\",\"image_style\":\"TOP\",\"btns\":${testButtonString},\"close_btn_color\":4291085508,\"bg_color\":4294243575,\"frame_color\":3207803699,\"text_color\":4280624421,\"header_text_color\":4280624421,\"trigger_id\":\"NWJhNTMxOThiZjVjZWE0NDZiMTUzYjZiXyRfbXY9NWJhNTMxOThiZjVjZWE0NDZiMTUzYjc1JnBpPWNtcA==\",\"uri\":\"${testUri}\",\"zipped_assets_url\":\"${testZippedAssetsUrl}\",\"duration\":${testDuration},\"message_close\":\"${testDismissType}\",\"use_webview\":${testUseWebView}, \"is_test_send\":${testIsTestSend}, \"image_alt\":\"${testImageAltText}\", \"language\":\"${testLanguage}\"}`
    const inAppMessage = new Braze.BrazeInAppMessage(testJson);
    expect(inAppMessage.message).toBe(testMessageBody);
    expect(inAppMessage.messageType).toBe(testMessageType.toLowerCase());
    expect(inAppMessage.uri).toBe(JSON.parse(`"${testUri}"`));
    expect(inAppMessage.useWebView).toBe(testUseWebView);
    expect(inAppMessage.zippedAssetsUrl).toBe(JSON.parse(`"${testZippedAssetsUrl}"`));
    expect(inAppMessage.duration).toBe(testDuration);
    expect(inAppMessage.extras).toEqual(JSON.parse(testExtras));
    expect(inAppMessage.clickAction).toBe(testClickAction.toLowerCase());
    expect(inAppMessage.dismissType).toBe(testDismissType.toLowerCase());
    expect(inAppMessage.imageUrl).toBe(JSON.parse(`"${testImageUrl}"`));
    expect(inAppMessage.header).toBe(testHeader);
    expect(inAppMessage.inAppMessageJsonString).toBe(testJson);
    expect(inAppMessage.buttons).toEqual(testButtons);
    expect(inAppMessage.isTestSend).toEqual(testIsTestSend);
    expect(inAppMessage.imageAltText).toEqual(testImageAltText);
    expect(inAppMessage.language).toEqual(testLanguage);
  });

  it('instantiates a BrazeInAppMessage object with the desired defaults', () => {
    const defaultMessageBody = '';
    const defaultMessageType = 'SLIDEUP';
    const defaultUri = '';
    const defaultImageUrl = '';
    const defaultZippedAssetsUrl = '';
    const defaultUseWebView = false;
    const defaultDuration = 5;
    const defaultExtras = {};
    const defaultClickAction = 'NONE';
    const defaultDismissType = 'AUTO_DISMISS';
    const defaultHeader = '';
    const defaultButtons = [];
    const defaultIsTestSend = false;
    const testJson = `{}`;
    const inAppMessage = new Braze.BrazeInAppMessage(testJson);
    expect(inAppMessage.message).toBe(defaultMessageBody);
    expect(inAppMessage.messageType).toBe(defaultMessageType.toLowerCase());
    expect(inAppMessage.uri).toBe(defaultUri);
    expect(inAppMessage.useWebView).toBe(defaultUseWebView);
    expect(inAppMessage.zippedAssetsUrl).toBe(defaultZippedAssetsUrl);
    expect(inAppMessage.duration).toBe(defaultDuration);
    expect(inAppMessage.extras).toEqual(defaultExtras);
    expect(inAppMessage.clickAction).toBe(defaultClickAction.toLowerCase());
    expect(inAppMessage.dismissType).toBe(defaultDismissType.toLowerCase());
    expect(inAppMessage.imageUrl).toBe(defaultImageUrl);
    expect(inAppMessage.header).toBe(defaultHeader);
    expect(inAppMessage.inAppMessageJsonString).toBe(testJson);
    expect(inAppMessage.buttons).toEqual(defaultButtons);
    expect(inAppMessage.isTestSend).toEqual(defaultIsTestSend);
  });

  it('instantiates a BrazeInAppMessage with mixed string and non-string extras', () => {
    const testJson = `{\"extras\":{\"string_key\":\"string_value\",\"number_key\":123,\"bool_key\":true}}`;
    const inAppMessage = new Braze.BrazeInAppMessage(testJson);
    // Only string extras should be included
    expect(inAppMessage.extras).toEqual({ string_key: 'string_value' });
  });

  it('returns the original JSON when calling BrazeInAppMessage.inAppMessageJsonString', () => {
    const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
    expect(inAppMessage.inAppMessageJsonString).toBe(testInAppMessageJson);
  });

  it('returns formatted string when calling BrazeInAppMessage.toString()', () => {
    const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
    const expectedToString = "BrazeInAppMessage:" +
      "\n  message: " + inAppMessage.message +
      "\n  header: " + inAppMessage.header +
      "\n  uri: " + inAppMessage.uri +
      "\n  imageUrl: " + inAppMessage.imageUrl +
      "\n  imageAltText: " + inAppMessage.imageAltText +
      "\n  language: " + inAppMessage.language +
      "\n  zippedAssetsUrl: " + inAppMessage.zippedAssetsUrl +
      "\n  useWebView: " + inAppMessage.useWebView +
      "\n  duration: " + inAppMessage.duration +
      "\n  clickAction: " + inAppMessage.clickAction +
      "\n  dismissType: " + inAppMessage.dismissType +
      "\n  messageType: " + inAppMessage.messageType +
      "\n  extras: " + JSON.stringify(inAppMessage.extras) +
      "\n  buttons: [" + inAppMessage.buttons.map((b) => b.toString()).join(', ') + "]" +
      "\n  isTestSend: " + inAppMessage.isTestSend;
    expect(inAppMessage.toString()).toBe(expectedToString);
  });

  test('it calls BrazeReactBridge.logInAppMessageClicked', () => {
    const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
    Braze.logInAppMessageClicked(inAppMessage);
    expect(NativeBrazeReactModule.logInAppMessageClicked).toBeCalledWith(testInAppMessageJson);
  });

  test('it calls BrazeReactBridge.logInAppMessageImpression', () => {
    const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
    Braze.logInAppMessageImpression(inAppMessage);
    expect(NativeBrazeReactModule.logInAppMessageImpression).toBeCalledWith(testInAppMessageJson);
  });

  test('it calls BrazeReactBridge.logInAppMessageButtonClicked', () => {
    const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
    const testId = 23;
    Braze.logInAppMessageButtonClicked(inAppMessage, testId);
    expect(NativeBrazeReactModule.logInAppMessageButtonClicked).toBeCalledWith(testInAppMessageJson, testId);
  });
});

describe('BrazeButton', () => {
  it('instantiates a BrazeButton object', () => {
    const testId = 53;
    const testClickAction = 'URI';
    const testText = 'some text';
    const testUri = "https:\\/\\/www.sometesturi.com";
    const testUseWebView = true;
    const testButtonJson = `{\"id\":${testId},\"text\":\"${testText}\",\"click_action\":\"${testClickAction}\",\"uri\":\"${testUri}\",\"use_webview\":${testUseWebView},\"bg_color\":4294967295,\"text_color\":4279990479,\"border_color\":4279990479}`;
    const button = new Braze.BrazeButton(JSON.parse(testButtonJson));
    expect(button.id).toBe(testId);
    expect(button.clickAction).toBe(testClickAction.toLowerCase());
    expect(button.text).toBe(testText);
    expect(button.uri).toBe(JSON.parse(`"${testUri}"`));
    expect(button.useWebView).toBe(testUseWebView);
    expect(button.toString()).toBe("BrazeButton:" +
      "\n  id: " + button.id +
      "\n  text: " + button.text +
      "\n  uri: " + button.uri +
      "\n  useWebView: " + button.useWebView +
      "\n  clickAction: " + button.clickAction);
  });

  it('instantiates a BrazeButton object with the desired defaults', () => {
    const defaultUri = '';
    const defaultText = '';
    const defaultUseWebView = false;
    const defaultClickAction = 'NONE';
    const defaultId = 0;
    const inAppMessage = new Braze.BrazeButton(`{}`);
    expect(inAppMessage.uri).toBe(defaultUri);
    expect(inAppMessage.useWebView).toBe(defaultUseWebView);
    expect(inAppMessage.text).toBe(defaultText);
    expect(inAppMessage.clickAction).toBe(defaultClickAction.toLowerCase());
    expect(inAppMessage.id).toBe(defaultId);
  });
});

describe('Braze.performInAppMessageAction', () => {
  describe.each([
    ['without buttonId', undefined],
    ['with buttonId 0', 0],
    ['with buttonId 1', 1],
  ])('performInAppMessageAction %s', (_, buttonId) => {
    test('calls BrazeReactBridge.performInAppMessageAction', () => {
      const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
      Braze.performInAppMessageAction(inAppMessage, buttonId);
      expect(NativeBrazeReactModule.performInAppMessageAction).toBeCalledWith(testInAppMessageJson, buttonId);
    });
  });

  test('performInAppMessageButtonAction delegates to performInAppMessageAction', () => {
    const inAppMessage = new Braze.BrazeInAppMessage(testInAppMessageJson);
    const buttonId = 0;
    Braze.performInAppMessageButtonAction(inAppMessage, buttonId);
    expect(NativeBrazeReactModule.performInAppMessageAction).toBeCalledWith(testInAppMessageJson, buttonId);
  });
});
