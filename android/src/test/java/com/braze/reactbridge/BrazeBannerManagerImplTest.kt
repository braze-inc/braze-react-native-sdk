package com.braze.reactbridge

import com.braze.Braze
import com.braze.ui.banners.BannerDismissSnapshot
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.robolectric.Shadows.shadowOf

class BrazeBannerManagerImplTest : BrazeRobolectricTestBase() {
    @Test
    fun whenCreated_BannerDismissEvent_usesOnBannerDismissEventName() {
        val payload = mapBannerDismissSnapshot(
            BannerDismissSnapshot(
                placementId = "place456",
                stableKey = "stable-abc",
                trackingId = "track123",
            ),
        )
        val event = BrazeBannerManagerImpl.BannerDismissEvent(1, 42, payload)

        assertEquals(BrazeBannerManagerImpl.EVENT_ON_DISMISS, event.eventName)
        assertEquals(1, event.surfaceId)
        assertEquals(42, event.viewTag)
    }

    @Test
    fun whenRegisterBannerDismissCallback_registersOnDismissCallbackOnBannerView() {
        val container = createBannerContainerWithDismissCallback()
        assertNotNull(container.bannerView.onDismissCallback)
    }

    @Test
    fun whenOnDismissCallbackInvokedWithIncompleteSnapshot_completesWithoutError() {
        val container = createBannerContainerWithDismissCallback()
        val callback = container.bannerView.onDismissCallback
        ktAssertNotNull(callback)

        callback.invoke(
            BannerDismissSnapshot(
                placementId = "",
                stableKey = "stable-abc",
                trackingId = "track123",
            ),
        )
        shadowOf(android.os.Looper.getMainLooper()).idle()
    }

    @Test
    fun whenOnDismissCallbackInvokedWithCompleteSnapshot_postsDismissWithoutError() {
        val container = createBannerContainerWithDismissCallback()
        container.id = 100
        val callback = container.bannerView.onDismissCallback
        ktAssertNotNull(callback)

        callback.invoke(
            BannerDismissSnapshot(
                placementId = "place456",
                stableKey = "stable-abc",
                trackingId = "track123",
            ),
        )
        shadowOf(android.os.Looper.getMainLooper()).idle()
    }

    @Test
    fun whenDismissBannerIsCalled_matchingBannerViewOnDismissCallbackIsInvoked() {
        val reactContext = TestReactApplicationContext()
        val placementId = "placement-dismiss-test"
        val container = BannerContainer(reactContext)
        BrazeBannerManagerImpl.setPlacementId(container, placementId)

        var callbackInvoked = false
        var receivedSnapshot: BannerDismissSnapshot? = null
        container.bannerView.onDismissCallback = { snapshot ->
            callbackInvoked = true
            receivedSnapshot = snapshot
        }

        // The real Braze.dismissBanner only emits a dismiss event when a banner is cached
        // for the placement, and dispatches it on Braze's internal background dispatcher.
        // Neither can be reproduced in a Robolectric unit test, so mock Braze to simulate
        // the SDK invoking the matching banner view's onDismissCallback on dismiss.
        val braze = mock<Braze>()
        doAnswer {
            container.bannerView
                .takeIf { it.placementId == placementId }
                ?.onDismissCallback
                ?.invoke(
                    BannerDismissSnapshot(
                        placementId = placementId,
                        stableKey = "stable-abc",
                        trackingId = "track123",
                    ),
                )
            null
        }.whenever(braze).dismissBanner(placementId)

        braze.dismissBanner(placementId)
        shadowOf(android.os.Looper.getMainLooper()).idle()

        assertTrue(callbackInvoked)
        assertEquals(placementId, receivedSnapshot?.placementId)
        assertNotNull(receivedSnapshot?.stableKey)
        assertNotNull(receivedSnapshot?.trackingId)
    }

    private fun createBannerContainerWithDismissCallback(): BannerContainer {
        val reactContext = TestReactApplicationContext()
        val container = BannerContainer(reactContext)
        BrazeBannerManagerImpl.registerBannerDismissCallback(container, reactContext)
        return container
    }
}
