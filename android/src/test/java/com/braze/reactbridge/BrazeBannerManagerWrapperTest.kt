package com.braze.reactbridge

import org.junit.Assert.assertTrue
import org.junit.Test

class BrazeBannerManagerWrapperTest : BrazeRobolectricTestBase() {
    @Test
    fun whenGetExportedCustomBubblingEventTypeConstants_delegatesToImpl() {
        val manager = BrazeBannerManager(TestReactApplicationContext())

        val constants = manager.exportedCustomBubblingEventTypeConstants

        ktAssertNotNull(constants)
        assertTrue(constants.containsKey(BrazeBannerManagerImpl.EVENT_HEIGHT_CHANGED))
        assertTrue(constants.containsKey(BrazeBannerManagerImpl.EVENT_ON_DISMISS))
    }
}
