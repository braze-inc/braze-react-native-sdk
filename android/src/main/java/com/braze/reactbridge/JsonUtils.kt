package com.braze.reactbridge

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONArray
import org.json.JSONObject

/**
 * Parses a `JSONObject` to a React Native map object.
 * The cases for each type follows all supported types of the `ReadableMap` class.
 */
fun jsonToNativeMap(jsonObject: JSONObject): ReadableMap {
    val nativeMap = WritableNativeMap()
    jsonObject.keys().forEach { key ->
        when (val value = jsonObject.get(key)) {
            is JSONObject -> nativeMap.putMap(key, jsonToNativeMap(value))
            is JSONArray -> nativeMap.putArray(key, jsonToNativeArray(value))
            is Boolean -> nativeMap.putBoolean(key, value)
            is Int -> nativeMap.putInt(key, value)
            is Double -> nativeMap.putDouble(key, value)
            is String -> nativeMap.putString(key, value)
            JSONObject.NULL -> nativeMap.putNull(key)
        }
    }
    return nativeMap
}

/**
 * Parses a `JSONArray` to a React Native array object.
 * The cases for each type follows all supported types of the `ReadableArray` class.
 */
fun jsonToNativeArray(jsonArray: JSONArray): ReadableArray {
    val nativeArray = WritableNativeArray()
    for (i in 0 until jsonArray.length()) {
        when (val value = jsonArray.opt(i)) {
            is JSONObject -> nativeArray.pushMap(jsonToNativeMap(value))
            is JSONArray -> nativeArray.pushArray(jsonToNativeArray(value))
            is Boolean -> nativeArray.pushBoolean(value)
            is Int -> nativeArray.pushInt(value)
            is Double -> nativeArray.pushDouble(value)
            is String -> nativeArray.pushString(value)
            JSONObject.NULL -> nativeArray.pushNull()
            else -> nativeArray.pushString(value.toString())
        }
    }
    return nativeArray
}
