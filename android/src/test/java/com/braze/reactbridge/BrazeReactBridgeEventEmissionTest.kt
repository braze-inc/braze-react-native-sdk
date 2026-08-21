@file:Suppress("UNCHECKED_CAST")

package com.braze.reactbridge

import android.app.Activity
import android.os.Bundle
import com.braze.Braze
import com.braze.Constants
import com.braze.configuration.BrazeConfig
import com.braze.enums.BrazePushEventType
import com.braze.events.BannersUpdatedEvent
import com.braze.events.BrazePushEvent
import com.braze.events.ContentCardsUpdatedEvent
import com.braze.events.FeatureFlagsUpdatedEvent
import com.braze.events.IEventSubscriber
import com.braze.models.push.BrazeNotificationPayload
import com.braze.ui.inappmessage.InAppMessageOperation
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify

/**
 * Native-to-JS bridge tests for [BrazeReactBridgeImpl] event emissions.
 *
 * Verifies that Braze SDK callbacks are serialized and emitted to JavaScript
 * through [RCTDeviceEventEmitter].
 */
class BrazeReactBridgeEventEmissionTest : BrazeRobolectricTestBase() {
    private lateinit var eventEmitter: RCTDeviceEventEmitter
    private lateinit var brazeMock: Braze
    private lateinit var bridge: BrazeReactBridgeImpl

    @Before
    fun setUpBridge() {
        eventEmitter = mock()
        brazeMock = mock()
        val reactContext = EventCapturingReactApplicationContext(eventEmitter)
        val brazeConfig = BrazeConfig.Builder()
            .setApiKey("test-api-key")
            .build()
        Braze.configure(reactContext, brazeConfig)
        bridge = BrazeReactBridgeImpl(reactContext, mock<Activity>())
        bridge.brazeTestingMock = brazeMock
        bridge.initialize("test-api-key", "test.endpoint.com")
    }

    @Test
    fun whenContentCardsUpdated_emitsContentCardsUpdatedEvent() {
        val subscriberCaptor = argumentCaptor<IEventSubscriber<ContentCardsUpdatedEvent>>()
        verify(brazeMock).subscribeToContentCardsUpdates(subscriberCaptor.capture())

        subscriberCaptor.firstValue.trigger(
            ContentCardsUpdatedEvent(emptyList(), "user_1", 1_700_000_000L, false),
        )

        val eventNameCaptor = argumentCaptor<String>()
        val payloadCaptor = argumentCaptor<WritableMap>()
        verify(eventEmitter).emit(eventNameCaptor.capture(), payloadCaptor.capture())
        assertEquals("contentCardsUpdated", eventNameCaptor.firstValue)
        assertNotNull(payloadCaptor.firstValue.getArray("cards"))
    }

    @Test
    fun whenContentCardsUpdated_withoutActiveReactInstance_doesNotEmit() {
        val inactiveEmitter = mock<RCTDeviceEventEmitter>()
        val inactiveContext = EventCapturingReactApplicationContext(
            eventEmitter = inactiveEmitter,
            activeReactInstance = false,
        )
        Braze.configure(
            inactiveContext,
            BrazeConfig.Builder().setApiKey("test-api-key").build(),
        )
        val inactiveBridge = BrazeReactBridgeImpl(inactiveContext, mock<Activity>())
        val inactiveBrazeMock = mock<Braze>()
        inactiveBridge.brazeTestingMock = inactiveBrazeMock
        inactiveBridge.initialize("test-api-key", "test.endpoint.com")

        val subscriberCaptor = argumentCaptor<IEventSubscriber<ContentCardsUpdatedEvent>>()
        verify(inactiveBrazeMock).subscribeToContentCardsUpdates(subscriberCaptor.capture())
        subscriberCaptor.firstValue.trigger(
            ContentCardsUpdatedEvent(emptyList(), "user_1", 1_700_000_000L, false),
        )

        verify(inactiveEmitter, never()).emit(any(), any())
    }

    @Test
    fun whenBannersUpdated_emitsBannerCardsUpdatedEvent() {
        val banner = createBanner(
            trackingId = "track_1",
            placementId = "home",
            html = "<div>banner</div>",
            isTestSend = false,
            expirationTimestampSeconds = 1_700_000_000L,
            isControl = false,
            properties = JSONObject(mapOf("key" to "value")),
        )
        val subscriberCaptor = argumentCaptor<IEventSubscriber<BannersUpdatedEvent>>()
        verify(brazeMock).subscribeToBannersUpdates(subscriberCaptor.capture())

        subscriberCaptor.firstValue.trigger(BannersUpdatedEvent(listOf(banner)))

        val eventNameCaptor = argumentCaptor<String>()
        val payloadCaptor = argumentCaptor<WritableMap>()
        verify(eventEmitter).emit(eventNameCaptor.capture(), payloadCaptor.capture())
        assertEquals("bannerCardsUpdated", eventNameCaptor.firstValue)
        assertEquals(1, payloadCaptor.firstValue.getArray("banners")?.size())
    }

    @Test
    fun whenFeatureFlagsUpdated_emitsFeatureFlagsUpdatedEvent() {
        val featureFlag = createFeatureFlag(
            id = "ff_1",
            enabled = true,
            propertiesJson = """{"enabled":true}""",
        )
        val subscriberCaptor = argumentCaptor<IEventSubscriber<FeatureFlagsUpdatedEvent>>()
        verify(brazeMock).subscribeToFeatureFlagsUpdates(subscriberCaptor.capture())

        subscriberCaptor.firstValue.trigger(FeatureFlagsUpdatedEvent(listOf(featureFlag)))

        val eventNameCaptor = argumentCaptor<String>()
        val payloadCaptor = argumentCaptor<com.facebook.react.bridge.WritableArray>()
        verify(eventEmitter).emit(eventNameCaptor.capture(), payloadCaptor.capture())
        assertEquals("featureFlagsUpdated", eventNameCaptor.firstValue)
        assertEquals(1, payloadCaptor.firstValue.size())
    }

    @Test
    fun whenPushNotificationReceived_emitsPushNotificationEvent() {
        bridge.addListener("pushNotificationEvent")

        val subscriberCaptor = argumentCaptor<IEventSubscriber<BrazePushEvent>>()
        verify(brazeMock).subscribeToPushNotificationEvents(subscriberCaptor.capture())

        val payloadBundle = Bundle().apply {
            putString("android_extra", "android_val")
            putString(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "https://example.com/deeplink")
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Title")
            putString(Constants.BRAZE_PUSH_CONTENT_KEY, "Body")
            putString(Constants.BRAZE_PUSH_SUMMARY_TEXT_KEY, "Summary")
            putString(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY, "https://example.com/image.png")
        }
        val realPayload = BrazeNotificationPayload(payloadBundle)
        val pushEvent = mock<BrazePushEvent> {
            on { eventType } doReturn BrazePushEventType.NOTIFICATION_RECEIVED
            on { notificationPayload } doReturn realPayload
        }

        subscriberCaptor.firstValue.trigger(pushEvent)

        val eventNameCaptor = argumentCaptor<String>()
        val payloadCaptor = argumentCaptor<WritableMap>()
        verify(eventEmitter).emit(eventNameCaptor.capture(), payloadCaptor.capture())
        assertEquals("pushNotificationEvent", eventNameCaptor.firstValue)
        assertEquals("push_received", payloadCaptor.firstValue.getString("payload_type"))
        assertEquals("https://example.com/deeplink", payloadCaptor.firstValue.getString("url"))
        assertEquals("Title", payloadCaptor.firstValue.getString("title"))
        assertEquals("Body", payloadCaptor.firstValue.getString("body"))
    }

    @Test
    fun whenPushNotificationOpened_emitsPushOpenedPayloadType() {
        bridge.addListener("pushNotificationEvent")

        val subscriberCaptor = argumentCaptor<IEventSubscriber<BrazePushEvent>>()
        verify(brazeMock).subscribeToPushNotificationEvents(subscriberCaptor.capture())

        val payloadBundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Opened")
            putString(Constants.BRAZE_PUSH_CONTENT_KEY, "Tap")
        }
        val realPayload = BrazeNotificationPayload(payloadBundle)
        val pushEvent = mock<BrazePushEvent> {
            on { eventType } doReturn BrazePushEventType.NOTIFICATION_OPENED
            on { notificationPayload } doReturn realPayload
        }

        subscriberCaptor.firstValue.trigger(pushEvent)

        val payloadCaptor = argumentCaptor<WritableMap>()
        verify(eventEmitter).emit(eq("pushNotificationEvent"), payloadCaptor.capture())
        assertEquals("push_opened", payloadCaptor.firstValue.getString("payload_type"))
    }

    @Test
    fun whenSdkAuthenticationErrorReceived_emitsSdkAuthenticationErrorEvent() {
        val subscriberCaptor = argumentCaptor<IEventSubscriber<com.braze.events.BrazeSdkAuthenticationErrorEvent>>()
        verify(brazeMock).subscribeToSdkAuthenticationFailures(subscriberCaptor.capture())

        val errorEvent = mock<com.braze.events.BrazeSdkAuthenticationErrorEvent> {
            on { errorCode } doReturn 401
            on { userId } doReturn "user_123"
            on { signature } doReturn "sig_abc"
            on { errorReason } doReturn "invalid_signature"
        }
        subscriberCaptor.firstValue.trigger(errorEvent)

        val eventNameCaptor = argumentCaptor<String>()
        val payloadCaptor = argumentCaptor<WritableMap>()
        verify(eventEmitter).emit(eventNameCaptor.capture(), payloadCaptor.capture())
        assertEquals("sdkAuthenticationError", eventNameCaptor.firstValue)
        assertEquals(401, payloadCaptor.firstValue.getInt("error_code"))
        assertEquals("user_123", payloadCaptor.firstValue.getString("user_id"))
        assertEquals("sig_abc", payloadCaptor.firstValue.getString("original_signature"))
        assertEquals("invalid_signature", payloadCaptor.firstValue.getString("error_reason"))
    }

    @Test
    fun whenInAppMessageDisplayed_emitsInAppMessageReceivedEvent() {
        bridge.subscribeToInAppMessage(useBrazeUI = false)
        bridge.addListener("inAppMessageReceived")

        val inAppMessageJson = AssetUtils.readJsonObjectFromAsset("in_app_message/modal_with_1_button.json")
        val mockInAppMessage = mock<com.braze.models.inappmessage.IInAppMessage> {
            on { forJsonPut() } doReturn inAppMessageJson
        }

        val listener = com.braze.ui.inappmessage.BrazeInAppMessageManager
            .getInstance()
            .inAppMessageManagerListener
        ktAssertNotNull(listener)

        val operation = listener.beforeInAppMessageDisplayed(mockInAppMessage)
        assertEquals(InAppMessageOperation.DISPLAY_LATER, operation)

        val eventNameCaptor = argumentCaptor<String>()
        val payloadCaptor = argumentCaptor<WritableMap>()
        verify(eventEmitter).emit(eventNameCaptor.capture(), payloadCaptor.capture())
        assertEquals("inAppMessageReceived", eventNameCaptor.firstValue)
        assertNotNull(payloadCaptor.firstValue.getMap("inAppMessage"))
    }

    @Test
    fun whenSubscribeToInAppMessage_withoutBrazeUi_setsDisplayLaterOperation() {
        bridge.subscribeToInAppMessage(useBrazeUI = false)

        val operation = getPrivateField(bridge, "inAppMessageDisplayOperation") as InAppMessageOperation
        assertEquals(InAppMessageOperation.DISPLAY_LATER, operation)
    }

    @Test
    fun whenSubscribeToInAppMessage_withBrazeUi_setsDisplayNowOperation() {
        bridge.subscribeToInAppMessage(useBrazeUI = true)

        val operation = getPrivateField(bridge, "inAppMessageDisplayOperation") as InAppMessageOperation
        assertEquals(InAppMessageOperation.DISPLAY_NOW, operation)
    }
}
