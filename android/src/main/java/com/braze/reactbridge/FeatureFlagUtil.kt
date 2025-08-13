package com.braze.reactbridge

import com.braze.models.FeatureFlag
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

private const val FEATURE_FLAG_PROPERTIES_TYPE = "type"
private const val FEATURE_FLAG_PROPERTIES_VALUE = "value"
const val FEATURE_FLAG_PROPERTIES_TYPE_STRING = "string"
const val FEATURE_FLAG_PROPERTIES_TYPE_NUMBER = "number"
const val FEATURE_FLAG_PROPERTIES_TYPE_BOOLEAN = "boolean"

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
            propJson.putString(FEATURE_FLAG_PROPERTIES_VALUE, ff.getStringProperty(key))
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
    }
    return propJson
}
