/**
 * @class CampaignProperties
 * @classdesc Represents campaign properties with methods to access various types of properties.
 * @property {Object} properties - The properties associated with the campaign.
 */

export class CampaignProperties {
    /**
     * @param {{ [key: string]: { type: string, value: any } }} inputProperties
     */
    constructor(inputProperties) {
        this.properties = inputProperties;
    }

    /**
     * @param {string} key
     * @returns {string|null}
     */
    getStringProperty(key) {
        const data = this.properties[key];
        if (data && data.type === 'string') {
            return this._safeCast(data.value);
        }
        console.error(`Property with key "${key}" is not of type string or does not exist.`);
        return null;
    }

    /**
     * @param {string} key
     * @returns {boolean|null}
     */
    getBooleanProperty(key) {
        const data = this.properties[key];
        if (data && data.type === 'boolean') {
            return this._safeCast(data.value);
        }
        console.error(`Property with key "${key}" is not of type boolean or does not exist.`);
        return null;
    }

    /**
     * @param {string} key
     * @returns {number|null}
     */
    getNumberProperty(key) {
        const data = this.properties[key];
        if (data && data.type === 'number') {
            return this._safeCast(data.value);
        }
        console.error(`Property with key "${key}" is not of type number or does not exist.`);
        return null;
    }

    /**
     * @param {string} key
     * @returns {number|null}
     */
    getTimestampProperty(key) {
        const data = this.properties[key];
        if (data && data.type === 'datetime') {
            return this._safeCast(data.value);
        }
        console.error(`Property with key "${key}" is not of type datetime or does not exist.`);
        return null;
    }

    /**
     * @param {string} key
     * @returns {Object|null}
     */
    getJSONProperty(key) {
        const data = this.properties[key];
        if (data && data.type === 'jsonobject') {
            return this._safeCast(data.value);
        }
        console.error(`Property with key "${key}" is not of type jsonobject or does not exist.`);
        return null;
    }

    /**
     * @param {string} key
     * @returns {string|null}
     */
    getImageProperty(key) {
        const data = this.properties[key];
        if (data && data.type === 'image') {
            return this._safeCast(data.value);
        }
        console.error(`Property with key "${key}" is not of type image or does not exist.`);
        return null;
    }

    /**
     * @template T
     * @param {*} value
     * @returns {T|null}
     */
    _safeCast(value) {
        return value;
    }
}