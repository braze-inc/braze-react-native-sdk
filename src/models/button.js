import { ClickAction } from './enums';

export class Button {
  constructor(buttonJson) {
    let idJson = buttonJson['id'];
    this.id = typeof idJson === 'number' ? idJson : 0;

    let textJson = buttonJson['text'];
    this.text = typeof textJson === 'string' ? textJson : '';

    let uriJson = buttonJson['uri'];
    this.uri = typeof uriJson === 'string' ? uriJson : '';

    let useWebViewJson = buttonJson['use_webview'];
    this.useWebView =
      typeof useWebViewJson === 'boolean' ? useWebViewJson : false;

    let clickActionJson = buttonJson['click_action'];
    this.clickAction = ClickAction['NONE'];
    if (typeof clickActionJson === 'string') {
      Object.values(ClickAction).forEach((action) => {
        if (action.toLowerCase().endsWith(clickActionJson.toLowerCase())) {
          this.clickAction = action;
        }
      });
    }
  }

  toString() {
    return (
      `BrazeButton:` +
      `\n  id: ${this.id}` +
      `\n  text: ${this.text}` +
      `\n  uri: ${this.uri}` +
      `\n  useWebView: ${this.useWebView}` +
      `\n  clickAction: ${this.clickAction}`
    );
  }
}
