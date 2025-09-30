package com.braze.reactbridge

import com.braze.models.FeatureFlag
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

const val FEATURE_FLAG_PROPERTIES_TYPE = "type"
const val FEATURE_FLAG_PROPERTIES_VALUE = "value"
const val FEATURE_FLAG_PROPERTIES_TYPE_STRING = "string"
const val FEATURE_FLAG_PROPERTIES_TYPE_NUMBER = "number"
const val FEATURE_FLAG_PROPERTIES_TYPE_BOOLEAN = "boolean"
const val FEATURE_FLAG_PROPERTIES_TYPE_TIMESTAMP = "datetime"
const val FEATURE_FLAG_PROPERTIES_TYPE_JSON = "jsonobject"
const val FEATURE_FLAG_PROPERTIES_TYPE_IMAGE = "image"

fun convertFeatureFlag(ff: FeatureFlag): WritableMap {
    val mappedFF = Arguments.createMap()
    mappedFF.putString("id", ff.id)
    mappedFF.putBoolean("enabled", ff.enabled)

    // Properties
    val properties = Arguments.createMap()
    processFeatureFlagProperties(ff, properties)
    mappedFF.putMap("properties", properties)
    return mappedFF
}

private fun processFeatureFlagProperties(ff: FeatureFlag, properties: WritableMap) {
    val jsonObjectIterator = ff.properties.keys()
    while (jsonObjectIterator.hasNext()) {
        val key = jsonObjectIterator.next()
        val prop = ff.properties.optJSONObject(key) ?: continue
        val type = prop.optString(FEATURE_FLAG_PROPERTIES_TYPE, "")
        if (!type.isNullOrBlank()) {
            val propJson = createPropertyJson(ff, key, type)
            properties.putMap(key, propJson)
        }
    }
}

private fun createPropertyJson(ff: FeatureFlag, key: String, type: String): WritableMap {
    val propJson = Arguments.createMap()
    propJson.putString(FEATURE_FLAG_PROPERTIES_TYPE, type)

    when (type) {
        FEATURE_FLAG_PROPERTIES_TYPE_STRING -> {
            ff.getStringProperty(key)?.let {
                propJson.putString(FEATURE_FLAG_PROPERTIES_VALUE, it)
            }
        }
        FEATURE_FLAG_PROPERTIES_TYPE_NUMBER -> {
            ff.getNumberProperty(key)?.let {
                propJson.putDouble(FEATURE_FLAG_PROPERTIES_VALUE, it.toDouble())
            }
        }
        FEATURE_FLAG_PROPERTIES_TYPE_BOOLEAN -> {
            ff.getBooleanProperty(key)?.let {
                propJson.putBoolean(FEATURE_FLAG_PROPERTIES_VALUE, it)
            }
        }
        FEATURE_FLAG_PROPERTIES_TYPE_TIMESTAMP -> {
            ff.getTimestampProperty(key)?.let {
                propJson.putLong(FEATURE_FLAG_PROPERTIES_VALUE, it.toLong())
            }
        }
        FEATURE_FLAG_PROPERTIES_TYPE_JSON -> {
            ff.getJSONProperty(key)?.let {
                propJson.putMap(FEATURE_FLAG_PROPERTIES_VALUE, jsonToNativeMap(it))
            }
        }
        FEATURE_FLAG_PROPERTIES_TYPE_IMAGE -> {
            ff.getImageProperty(key)?.let {
                propJson.putString(FEATURE_FLAG_PROPERTIES_VALUE, it.toString())
            }
        }
    }
    return propJson
}
