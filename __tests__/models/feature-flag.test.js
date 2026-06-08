import Braze from '../../src/index';
const { CampaignProperties } = require('../../src/models/campaign-properties');
const { FeatureFlag } = require('../../src/models/feature-flag');
const NativeBrazeReactModule = require('../../src/specs/NativeBrazeReactModule').default;

const testFeatureFlagJson = {
  id: 'test_flag_id',
  enabled: true,
  properties: {
    string_prop: { type: 'string', value: 'test_string' },
    bool_prop: { type: 'boolean', value: false },
    number_prop: { type: 'number', value: 123.45 },
    timestamp_prop: { type: 'datetime', value: 1672531200000 },
    json_prop: { type: 'jsonobject', value: { key1: 'value1', key2: 42 } },
    image_prop: { type: 'image', value: 'https://example.com/image.png' },
    mismatched_prop: { type: 'string', value: 123 },
  },
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('FeatureFlag', () => {
  let featureFlagInstance;

  beforeEach(() => {
    featureFlagInstance = new FeatureFlag(testFeatureFlagJson);
  });

  test('constructor correctly assigns id, enabled, and properties', () => {
    expect(featureFlagInstance.id).toBe('test_flag_id');
    expect(featureFlagInstance.enabled).toBe(true);
    expect(featureFlagInstance.properties).toBeInstanceOf(CampaignProperties);
  });

  test('constructor uses default values when id and enabled are missing', () => {
    const minimalFeatureFlag = new FeatureFlag({});
    expect(minimalFeatureFlag.id).toBe('');
    expect(minimalFeatureFlag.enabled).toBe(false);
    expect(minimalFeatureFlag.properties).toBeInstanceOf(CampaignProperties);
  });

  describe.each([
    ['getBooleanProperty', 'bool_prop', false, 'string_prop'],
    ['getStringProperty', 'string_prop', 'test_string', 'bool_prop'],
    ['getNumberProperty', 'number_prop', 123.45, 'string_prop'],
    ['getTimestampProperty', 'timestamp_prop', 1672531200000, 'string_prop'],
    ['getJSONProperty', 'json_prop', { key1: 'value1', key2: 42 }, 'string_prop'],
    ['getImageProperty', 'image_prop', 'https://example.com/image.png', 'string_prop'],
  ])('property getter: %s', (methodName, validKey, expectedValue, wrongTypeKey) => {
    test(`correctly delegates to CampaignProperties`, () => {
      const value = featureFlagInstance[methodName](validKey);
      expect(value).toEqual(expectedValue);
    });

    test(`returns null for non-existent key`, () => {
      const value = featureFlagInstance[methodName]('non_existent_key');
      expect(value).toBeNull();
    });

    test(`returns null for mismatched type`, () => {
      const value = featureFlagInstance[methodName](wrongTypeKey);
      expect(value).toBeNull();
    });
  });

  describe('Braze.getFeatureFlag - additional cases', () => {
    test('it resolves with null if the native bridge returns null', async () => {
      NativeBrazeReactModule.getFeatureFlag.mockResolvedValue(null);
      const featureFlag = await Braze.getFeatureFlag('test_flag_id');
      expect(NativeBrazeReactModule.getFeatureFlag).toBeCalledWith('test_flag_id');
      expect(featureFlag).toBeNull();
    });

    test('it resolves with null and logs error if the bridge call fails', async () => {
      const originalError = console.error;
      console.error = jest.fn();
      const mockError = new Error('Native bridge error');
      NativeBrazeReactModule.getFeatureFlag.mockRejectedValue(mockError);
      const featureFlag = await Braze.getFeatureFlag('test_flag_id');
      expect(NativeBrazeReactModule.getFeatureFlag).toBeCalledWith('test_flag_id');
      expect(console.error).toHaveBeenCalledWith("Error fetching feature flag:", mockError);
      expect(featureFlag).toBeNull();
      console.error = originalError;
    });

    test('it resolves with a FeatureFlag instance on success', async () => {
      const mockFeatureFlagData = {
        id: 'test_flag',
        enabled: true,
        properties: { key: { type: 'string', value: 'value' } }
      };
      NativeBrazeReactModule.getFeatureFlag.mockResolvedValue(mockFeatureFlagData);
      const featureFlag = await Braze.getFeatureFlag('test_flag');
      expect(NativeBrazeReactModule.getFeatureFlag).toBeCalledWith('test_flag');
      expect(featureFlag).toBeInstanceOf(FeatureFlag);
      expect(featureFlag.id).toBe('test_flag');
      expect(featureFlag.enabled).toBe(true);
    });
  });
});
