package com.braze.reactbridge.util

import androidx.annotation.RestrictTo
import com.braze.support.BrazeLogger.Priority.W
import com.braze.support.BrazeLogger.brazelog
import com.braze.support.BrazeLogger.getBrazeLogTag
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

private var shouldUseJavaMapForMapFactory = false
private val TAG = "MapFactory".getBrazeLogTag()

/**
 * Gets a mutable map. Note that in tests, we use JavaOnlyMap and JavaOnlyArray
 * to avoid issues with NativeLoader. In production, we use WritableNativeMap.
 *
 * @return The mutable map
 */
fun getMutableMap(): WritableMap {
    return if (shouldUseJavaMapForMapFactory) {
        brazelog(TAG, priority = W) {
            "Using JavaOnlyMap for WritableMap. This should only fire for tests!"
        }
        JavaOnlyMap()
    } else {
        WritableNativeMap()
    }
}

/**
 * Gets a mutable array. Note that in tests, we use JavaOnlyArray
 * to avoid issues with NativeLoader. In production, we use WritableNativeArray.
 *
 * @return The mutable array
 */
fun getMutableArray(): WritableArray {
    return if (shouldUseJavaMapForMapFactory) {
        brazelog(TAG, priority = W) {
            "Using JavaOnlyArray for WritableArray. This should only fire for tests!"
        }
        JavaOnlyArray()
    } else {
        WritableNativeArray()
    }
}

/**
 * This method is only visible for Braze internal use and testing.
 * It allows tests to set whether to use JavaOnlyMap/JavaOnlyArray
 * or WritableNativeMap/WritableNativeArray.
 *
 * @param shouldUseJavaMap Whether to use JavaOnlyMap/JavaOnlyArray
 */
@RestrictTo(RestrictTo.Scope.TESTS)
internal fun setShouldUseJavaMapForMapFactory(shouldUseJavaMap: Boolean) {
    shouldUseJavaMapForMapFactory = shouldUseJavaMap
}
