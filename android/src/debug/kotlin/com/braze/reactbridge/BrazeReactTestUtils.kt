package com.braze.reactbridge

import android.os.Build
import android.os.Looper.getMainLooper
import org.junit.Assert.assertNotNull
import org.robolectric.Shadows.shadowOf
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@OptIn(ExperimentalContracts::class)
fun ktAssertNotNull(thing: Any?, failureMessage: String? = null) {
    contract {
        returns() implies (thing != null)
    }
    assertNotNull(failureMessage, thing)
}

/**
 * Waits until the given condition is true
 */
fun blockUntil(idleSleepTimeMs: Long = 10, condition: () -> Boolean) {
    if (Build.FINGERPRINT == "robolectric") {
        // Execute all tasks posted to main looper
        shadowOf(getMainLooper()).idle()
    }

    while (!condition()) {
        // Do nothing
        Thread.sleep(idleSleepTimeMs)
    }
}
