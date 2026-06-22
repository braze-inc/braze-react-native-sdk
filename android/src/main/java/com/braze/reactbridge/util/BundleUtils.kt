package com.braze.reactbridge.util

import android.os.Bundle

/**
 * Reads a boolean value from a [Bundle] when the stored type may be either [Boolean] or [String].
 */
fun getBundleValueAsBoolean(bundle: Bundle, key: String): Boolean {
    if (!bundle.containsKey(key)) return false
    val booleanValue = try {
        bundle.getBoolean(key)
    } catch (_: ClassCastException) {
        false
    }
    return booleanValue || try {
        bundle.getString(key)?.equals("true", ignoreCase = true) == true
    } catch (_: ClassCastException) {
        false
    }
}
