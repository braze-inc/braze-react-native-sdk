package com.braze.reactbridge

import com.braze.models.FeatureFlag
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_BOOLEAN
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_DATETIME
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_IMAGE
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_JSON
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_NUMBER
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_STRING
import com.braze.reactbridge.util.getMutableMap
import com.braze.support.BrazeLogger.brazelog
import com.braze.support.BrazeLogger.getBrazeLogTag
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap

const val FEATURE_FLAG_PROPERTIES_TYPE = "type"
const val FEATURE_FLAG_PROPERTIES_VALUE = "value"

private val TAG = "FeatureFlagUtil".getBrazeLogTag()

fun convertFeatureFlag(ff: FeatureFlag): WritableMap {
    val mappedFF = getMutableMap()
    mappedFF.putString("id", ff.id)
    mappedFF.putBoolean("enabled", ff.enabled)

    // Properties
    val properties = processFeatureFlagProperties(ff)
    mappedFF.putMap("properties", properties)
    return mappedFF
}

private fun processFeatureFlagProperties(ff: FeatureFlag): ReadableMap {
    val properties = getMutableMap()

    val jsonObjectIterator = ff.properties.keys()
    while (jsonObjectIterator.hasNext()) {
        val key = jsonObjectIterator.next()
        val prop = ff.properties.optJSONObject(key)
        if (prop == null) {
            brazelog(TAG) { "Property for key $key is null or not a JSONObject, skipping..." }
            continue
        }

        val type = prop.optString(FEATURE_FLAG_PROPERTIES_TYPE, "")
        if (!type.isNullOrBlank()) {
            val propJson = createPropertyJson(ff, key, type)
            properties.putMap(key, propJson)
        }
    }

    return properties
}

private fun createPropertyJson(ff: FeatureFlag, key: String, type: String): WritableMap {
    val propJson = getMutableMap()
    propJson.putString(FEATURE_FLAG_PROPERTIES_TYPE, type)

    when (type) {
        PROPERTIES_TYPE_STRING -> {
            ff.getStringProperty(key)?.let {
                propJson.putString(FEATURE_FLAG_PROPERTIES_VALUE, it)
            }
        }
        PROPERTIES_TYPE_NUMBER -> {
            ff.getNumberProperty(key)?.let {
                propJson.putDouble(FEATURE_FLAG_PROPERTIES_VALUE, it.toDouble())
            }
        }
        PROPERTIES_TYPE_BOOLEAN -> {
            ff.getBooleanProperty(key)?.let {
                propJson.putBoolean(FEATURE_FLAG_PROPERTIES_VALUE, it)
            }
        }
        PROPERTIES_TYPE_DATETIME -> {
            ff.getTimestampProperty(key)?.let {
                propJson.putLong(FEATURE_FLAG_PROPERTIES_VALUE, it)
            }
        }
        PROPERTIES_TYPE_JSON -> {
            ff.getJSONProperty(key)?.let {
                propJson.putMap(FEATURE_FLAG_PROPERTIES_VALUE, it.toNativeMap())
            }
        }
        PROPERTIES_TYPE_IMAGE -> {
            ff.getImageProperty(key)?.let {
                propJson.putString(FEATURE_FLAG_PROPERTIES_VALUE, it)
            }
        }
    }
    return propJson
}
