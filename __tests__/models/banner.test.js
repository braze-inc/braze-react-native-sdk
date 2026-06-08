import { Banner } from '../../src/models/banner';
const { CampaignProperties } = require('../../src/models/campaign-properties');

const testBannerJson = {
  trackingId: 'test_tracking_id',
  placementId: 'test_placement_id',
  isTestSend: true,
  isControl: false,
  expiresAt: 1672531200,
  html: '<div>Test Banner</div>',
  properties: {
    string_prop: { type: 'string', value: 'test_string' },
    bool_prop: { type: 'boolean', value: true },
    number_prop: { type: 'number', value: 42.5 },
    timestamp_prop: { type: 'datetime', value: 1672531200000 },
    json_prop: { type: 'jsonobject', value: { key: 'value' } },
    image_prop: { type: 'image', value: 'https://example.com/image.png' },
  },
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('Banner', () => {
  let bannerInstance;

  beforeEach(() => {
    bannerInstance = new Banner(testBannerJson);
  });

  test('constructor correctly assigns all properties', () => {
    expect(bannerInstance.trackingId).toBe('test_tracking_id');
    expect(bannerInstance.placementId).toBe('test_placement_id');
    expect(bannerInstance.isTestSend).toBe(true);
    expect(bannerInstance.isControl).toBe(false);
    expect(bannerInstance.expiresAt).toBe(1672531200);
    expect(bannerInstance.html).toBe('<div>Test Banner</div>');
    expect(bannerInstance.properties).toBeInstanceOf(CampaignProperties);
  });

  test('constructor uses default values when properties are missing', () => {
    const minimalBanner = new Banner({});
    expect(minimalBanner.trackingId).toBe('');
    expect(minimalBanner.placementId).toBe('');
    expect(minimalBanner.isTestSend).toBe(false);
    expect(minimalBanner.isControl).toBe(false);
    expect(minimalBanner.expiresAt).toBe(0);
    expect(minimalBanner.html).toBe('');
    expect(minimalBanner.properties).toBeInstanceOf(CampaignProperties);
  });

  describe.each([
    ['getBooleanProperty', 'bool_prop', true, 'string_prop'],
    ['getStringProperty', 'string_prop', 'test_string', 'bool_prop'],
    ['getNumberProperty', 'number_prop', 42.5, 'string_prop'],
    ['getTimestampProperty', 'timestamp_prop', 1672531200000, 'string_prop'],
    ['getJSONProperty', 'json_prop', { key: 'value' }, 'string_prop'],
    ['getImageProperty', 'image_prop', 'https://example.com/image.png', 'string_prop'],
  ])('property getter: %s', (methodName, validKey, expectedValue, wrongTypeKey) => {
    test(`correctly delegates to CampaignProperties`, () => {
      const value = bannerInstance[methodName](validKey);
      expect(value).toEqual(expectedValue);
    });

    test(`returns null for non-existent key`, () => {
      const value = bannerInstance[methodName]('non_existent_key');
      expect(value).toBeNull();
    });

    test(`returns null for mismatched type`, () => {
      const value = bannerInstance[methodName](wrongTypeKey);
      expect(value).toBeNull();
    });
  });
});
