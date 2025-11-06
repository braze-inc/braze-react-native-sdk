package com.braze.reactbridge

import com.braze.reactbridge.util.getMutableArray
import com.braze.reactbridge.util.getMutableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONObject.NULL

/**
 * Parses a `JSONObject` to a React Native map object.
 * The cases for each type follows all supported types of the `ReadableMap` class.
 */
fun JSONObject?.toNativeMap(): ReadableMap {
    val nativeMap = getMutableMap()
    if (this == null) {
        return nativeMap
    }
    keys().forEach { key ->
        when (val value = get(key)) {
            is JSONObject -> nativeMap.putMap(key, value.toNativeMap())
            is JSONArray -> nativeMap.putArray(key, value.toNativeArray())
            is Boolean -> nativeMap.putBoolean(key, value)
            is Int -> nativeMap.putInt(key, value)
            is Double -> nativeMap.putDouble(key, value)
            is String -> nativeMap.putString(key, value)
            is Long -> nativeMap.putLong(key, value)
            NULL -> nativeMap.putNull(key)
        }
    }
    return nativeMap
}

/**
 * Parses a `JSONArray` to a React Native array object.
 * The cases for each type follows all supported types of the `ReadableArray` class.
 */
fun JSONArray?.toNativeArray(): ReadableArray {
    val nativeArray = getMutableArray()
    if (this == null) {
        return nativeArray
    }
    for (i in 0 until length()) {
        when (val value = opt(i)) {
            is JSONObject -> nativeArray.pushMap(value.toNativeMap())
            is JSONArray -> nativeArray.pushArray(value.toNativeArray())
            is Boolean -> nativeArray.pushBoolean(value)
            is Int -> nativeArray.pushInt(value)
            is Double -> nativeArray.pushDouble(value)
            is String -> nativeArray.pushString(value)
            NULL -> nativeArray.pushNull()
            is Long -> nativeArray.pushLong(value)
            else -> nativeArray.pushString(value.toString())
        }
    }
    return nativeArray
}

/**
 * Converts all dictionary keys from snake_case to camelCase format. It will convert
 * the keys of nested dictionaries and arrays containing dictionaries. The receiver JSONObject
 * should have snake_case keys.
 * @param keysToPreserve A list of keys to preserve during conversion.
 * @param specialCases Special cases where the key should be replaced by the specified value.
 * @return A new WritableMap with keys properly formatted to camelCase.
 */
fun JSONObject.formatToCamelCase(
    keysToPreserve: List<String> = emptyList(),
    specialCases: Map<String, String> = emptyMap()
): WritableMap {
    val newMap = getMutableMap()

    keys().forEach { key ->
        val value = get(key)

        if (keysToPreserve.contains(key)) {
            newMap.addValue(key, value)
        } else {
            val camelKey = specialCases[key] ?: key.snakeToCamelCase()
            newMap.addValueWithCamelKey(camelKey, value, keysToPreserve, specialCases)
        }
    }
    return newMap
}

/**
 * Converts a snake_case string to camelCase format:
 *   e.g. "is_test_send" -> "isTestSend"
 */
private fun String.snakeToCamelCase(): String {
    val components = this.split("_")
    if (components.isEmpty()) return this

    val camelString = StringBuilder(components[0])
    for (i in 1 until components.size) {
        val component = components[i]
        if (component.isNotEmpty()) {
            // Capitalize first char
            camelString.append(component.replaceFirstChar { it.uppercase() })
        }
    }
    return camelString.toString()
}

/**
 * Helper function to add a value to the map with the original key.
 */
private fun WritableMap.addValue(key: String, value: Any) {
    when (value) {
        is JSONObject -> putMap(key, value.toNativeMap())
        is JSONArray -> putArray(key, value.toNativeArray())
        is Boolean -> putBoolean(key, value)
        is Int -> putInt(key, value)
        is Double -> putDouble(key, value)
        is String -> putString(key, value)
        is Long -> putLong(key, value)
        NULL -> putNull(key)
        else -> putString(key, value.toString())
    }
}

/**
 * Adds a value to the map with a camelCase key.
 */
private fun WritableMap.addValueWithCamelKey(
    camelKey: String,
    value: Any,
    keysToPreserve: List<String>,
    specialCases: Map<String, String>
) {
    when (value) {
        is JSONObject -> {
            putMap(camelKey, value.formatToCamelCase(keysToPreserve, specialCases))
        }

        is JSONArray -> {
            putArray(camelKey, value.formatToCamelCase(keysToPreserve, specialCases))
        }

        is Boolean -> putBoolean(camelKey, value)
        is Int -> putInt(camelKey, value)
        is Double -> putDouble(camelKey, value)
        is String -> putString(camelKey, value)
        is Long -> putLong(camelKey, value)
        NULL -> putNull(camelKey)
        else -> putString(camelKey, value.toString())
    }
}

/**
 * Converts the keys of the array and nested objects to camelCase.
 */
private fun JSONArray.formatToCamelCase(
    keysToPreserve: List<String>,
    specialCases: Map<String, String>
): WritableArray {
    val newArray = getMutableArray()
    for (i in 0 until length()) {
        val item = opt(i)
        if (item is JSONObject) {
            newArray.pushMap(item.formatToCamelCase(keysToPreserve, specialCases))
        } else {
            newArray.addArrayItem(item)
        }
    }
    return newArray
}

/**
 * Adds items to an array.
 */
private fun WritableArray.addArrayItem(item: Any?) {
    when (item) {
        is Boolean -> pushBoolean(item)
        is Int -> pushInt(item)
        is Double -> pushDouble(item)
        is String -> pushString(item)
        is Long -> pushLong(item)
        NULL -> pushNull()
        else -> pushString(item.toString())
    }
}
