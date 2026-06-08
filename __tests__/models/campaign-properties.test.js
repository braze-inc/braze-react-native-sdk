const { CampaignProperties } = require('../../src/models/campaign-properties');

const testPropertyJson = {
  string_key: { type: 'string', value: 'test_string' },
  boolean_key: { type: 'boolean', value: true },
  number_key: { type: 'number', value: 123.45 },
  timestamp_key: { type: 'datetime', value: 1672531200000 },
  json_key: { type: 'jsonobject', value: { key1: 'value1', key2: 42 } },
  image_key: { type: 'image', value: 'https://example.com/image.png' },
  mismatched_key: { type: 'string', value: 123 },
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('CampaignProperties', () => {
  let campaignProperties;

  beforeEach(() => {
    campaignProperties = new CampaignProperties(testPropertyJson);
  });

  test('constructor correctly assigns properties', () => {
    expect(campaignProperties.properties).toEqual(testPropertyJson);
  });

  describe.each([
    ['getStringProperty', 'string_key', 'test_string', 'boolean_key'],
    ['getBooleanProperty', 'boolean_key', true, 'string_key'],
    ['getNumberProperty', 'number_key', 123.45, 'string_key'],
    ['getTimestampProperty', 'timestamp_key', 1672531200000, 'string_key'],
    ['getJSONProperty', 'json_key', { key1: 'value1', key2: 42 }, 'string_key'],
    ['getImageProperty', 'image_key', 'https://example.com/image.png', 'string_key'],
  ])('property getter: %s', (methodName, validKey, expectedValue, wrongTypeKey) => {
    test(`returns correct value for valid key`, () => {
      const value = campaignProperties[methodName](validKey);
      expect(value).toEqual(expectedValue);
    });

    test(`returns null for mismatched type`, () => {
      const value = campaignProperties[methodName](wrongTypeKey);
      expect(value).toBeNull();
    });

    test(`returns null for non-existent key`, () => {
      const value = campaignProperties[methodName]('non_existent_key');
      expect(value).toBeNull();
    });
  });
});
