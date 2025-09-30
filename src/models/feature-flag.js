import { CampaignProperties } from "./campaign-properties";

/**
 * @class FeatureFlag
 * @classdesc Represents a feature flag with its properties and methods to access them.
 * @property {boolean} enabled - Indicates if the feature flag is enabled.
 * @property {Object} properties - The properties associated with the feature flag.
 * @property {string} id - The unique identifier for the feature flag.
 */
export class FeatureFlag {
    constructor(data) {
        let featureFlagJson = data;

        this.enabled = featureFlagJson['enabled'] || false;
        this.id = featureFlagJson['id'] || '';
        this.properties = new CampaignProperties(featureFlagJson['properties'] || {});
    }

    /**
     * Retrieves a boolean property from the feature flag's properties.
     * @param {string} key The property key to retrieve.
     * @returns {boolean|null} The boolean property value or null if not found.
     */
    getBooleanProperty(key) {
        return this.properties.getBooleanProperty(key);
    }

    /**
     * Retrieves a number property from the feature flag's properties.
     * @param {string} key The property key to retrieve.
     * @returns {number|null} The number property value or null if not found.
     */
    getNumberProperty(key) {
        return this.properties.getNumberProperty(key);
    }

    /**
     * Retrieves a string property from the feature flag's properties.
     * @param {string} key The property key to retrieve.
     * @returns {string|null} The string property value or null if not found.
     */
    getStringProperty(key) {
        return this.properties.getStringProperty(key);
    }

    /**
     * Retrieves a timestamp property from the feature flag's properties.
     * @param {string} key The property key to retrieve.
     * @returns {number|null} The timestamp property value or null if not found.
     */
    getTimestampProperty(key) {
        return this.properties.getTimestampProperty(key);
    }

    /**
     * Retrieves a JSON property from the feature flag's properties.
     * @param {string} key The property key to retrieve.
     * @returns {Object|null} The JSON property value or null if not found.
     */
    getJSONProperty(key) {
        return this.properties.getJSONProperty(key);
    }

    /**
     * Retrieves an image property from the feature flag's properties.
     * @param {string} key The property key to retrieve.
     * @returns {string|null} The image property value or null if not found.
     */
    getImageProperty(key) {
        return this.properties.getImageProperty(key);
    }
}