import { CampaignProperties } from "./campaign-properties";

/**
 * @class Banner
 * @classdesc Represents a banner object with various properties and methods to access them.
 * @property {string} trackingId - The tracking identifier for the banner.
 * @property {string} placementId - The placement identifier for the banner.
 * @property {boolean} isTestSend - Indicates if the banner is a test send.
 * @property {boolean} isControl - Indicates if the banner is a control.
 * @property {number} expiresAt - The expiration timestamp of the banner.
 * @property {Object} properties - The properties associated with the banner.
 * @property {string} html - The HTML content of the banner.
 */
export class Banner {
    constructor(data) {
        let bannerJson = data;
        this.trackingId = bannerJson['trackingId'] || '';
        this.placementId = bannerJson['placementId'] || '';
        this.isTestSend = bannerJson['isTestSend'] || false;
        this.isControl = bannerJson['isControl'] || false;
        this.expiresAt = bannerJson['expiresAt'] || 0;
        this.properties = new CampaignProperties(bannerJson['properties'] || {});
        this.html = bannerJson['html'] || '';
    }

    /**
     * Retrieves a boolean property from the banner's properties.
     * @param {string} key The property key to retrieve.
     * @returns {boolean|null} The boolean property value or null if not found.
     */
    getBooleanProperty(key) {
        return this.properties.getBooleanProperty(key);
    }

    /**
     * Retrieves a number property from the banner's properties.
     * @param {string} key The property key to retrieve.
     * @returns {number|null} The number property value or null if not found.
     */
    getNumberProperty(key) {
        return this.properties.getNumberProperty(key);
    }

    /**
     * Retrieves a string property from the banner's properties.
     * @param {string} key The property key to retrieve.
     * @returns {string|null} The string property value or null if not found.
     */
    getStringProperty(key) {
        return this.properties.getStringProperty(key);
    }

    /**
     * Retrieves a timestamp property from the banner's properties.
     * @param {string} key The property key to retrieve.
     * @returns {number|null} The timestamp property value or null if not found.
     */
    getTimestampProperty(key) {
        return this.properties.getTimestampProperty(key);
    }

    /**
     * Retrieves a JSON property from the banner's properties.
     * @param {string} key The property key to retrieve.
     * @returns {Object|null} The JSON property value or null if not found.
     */
    getJSONProperty(key) {
        return this.properties.getJSONProperty(key);
    }

    /**
     * Retrieves an image property from the banner's properties.
     * @param {string} key The property key to retrieve.
     * @returns {string|null} The image property value or null if not found.
     */
    getImageProperty(key) {
        return this.properties.getImageProperty(key);
    }
}