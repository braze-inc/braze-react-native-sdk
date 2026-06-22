package com.braze.reactbridge

import android.os.Bundle
import com.braze.reactbridge.util.getBundleValueAsBoolean
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class BundleUtilsTest : BrazeRobolectricTestBase() {

    @Test
    fun whenKeyAbsent_getBundleValueAsBoolean_returnsFalse() {
        val bundle = Bundle()

        assertFalse(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsBooleanTrue_getBundleValueAsBoolean_returnsTrue() {
        val bundle = Bundle().apply {
            putBoolean(TEST_KEY, true)
        }

        assertTrue(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsBooleanFalse_getBundleValueAsBoolean_returnsFalse() {
        val bundle = Bundle().apply {
            putBoolean(TEST_KEY, false)
        }

        assertFalse(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsStringTrue_getBundleValueAsBoolean_returnsTrue() {
        val bundle = Bundle().apply {
            putString(TEST_KEY, "true")
        }

        assertTrue(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsStringFalse_getBundleValueAsBoolean_returnsFalse() {
        val bundle = Bundle().apply {
            putString(TEST_KEY, "false")
        }

        assertFalse(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsUppercaseStringTrue_getBundleValueAsBoolean_returnsTrue() {
        val bundle = Bundle().apply {
            putString(TEST_KEY, "TRUE")
        }

        assertTrue(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsMixedCaseStringTrue_getBundleValueAsBoolean_returnsTrue() {
        val bundle = Bundle().apply {
            putString(TEST_KEY, "True")
        }

        assertTrue(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsUppercaseStringFalse_getBundleValueAsBoolean_returnsFalse() {
        val bundle = Bundle().apply {
            putString(TEST_KEY, "FALSE")
        }

        assertFalse(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsUnsupportedType_getBundleValueAsBoolean_returnsFalse() {
        val bundle = Bundle().apply {
            putInt(TEST_KEY, 1)
        }

        assertFalse(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    @Test
    fun whenStoredAsEmptyString_getBundleValueAsBoolean_returnsFalse() {
        val bundle = Bundle().apply {
            putString(TEST_KEY, "")
        }

        assertFalse(getBundleValueAsBoolean(bundle, TEST_KEY))
    }

    companion object {
        private const val TEST_KEY = "test_boolean_key"
    }
}
