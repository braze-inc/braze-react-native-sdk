package com.braze.reactbridge

import android.os.Bundle
import com.braze.Constants
import com.braze.models.push.BrazeNotificationPayload
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PushPayloadMapperTest : BrazeRobolectricTestBase() {

    @Test
    fun whenCalled_createPushNotificationMap_setsPayloadType() {
        val bundle = Bundle()
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertEquals("push_opened", result.getString("payload_type"))
    }

    @Test
    fun whenCalledWithPushReceived_createPushNotificationMap_setsCorrectPayloadType() {
        val bundle = Bundle()
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_received"
        )

        assertEquals("push_received", result.getString("payload_type"))
    }

    @Test
    fun whenDeepLinkOverrideProvided_createPushNotificationMap_usesOverride() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://from/payload")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened",
            deepLinkOverride = "myapp://override/url"
        )

        assertEquals("myapp://override/url", result.getString("url"))
    }

    @Test
    fun whenNoDeepLinkOverride_createPushNotificationMap_usesPayloadDeeplink() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://from/payload")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertEquals("myapp://from/payload", result.getString("url"))
    }

    @Test
    fun whenTitleProvided_createPushNotificationMap_setsTitle() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Test Title")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertEquals("Test Title", result.getString("title"))
    }

    @Test
    fun whenContentProvided_createPushNotificationMap_setsBody() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_CONTENT_KEY, "Test Body")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertEquals("Test Body", result.getString("body"))
    }

    @Test
    fun whenSummaryTextProvided_createPushNotificationMap_setsSummaryText() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_SUMMARY_TEXT_KEY, "Summary Text")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertEquals("Summary Text", result.getString("summary_text"))
    }

    @Test
    fun whenImageUrlProvided_createPushNotificationMap_setsImageUrl() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY, "https://example.com/image.png")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened",
            rawExtras = bundle
        )

        assertEquals("https://example.com/image.png", result.getString("image_url"))
    }

    @Test
    fun whenUseWebviewTrue_createPushNotificationMap_setsUseWebviewTrue() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_OPEN_URI_IN_WEBVIEW_KEY, "true")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertTrue(result.getBoolean("use_webview"))
    }

    @Test
    fun whenUseWebviewFalse_createPushNotificationMap_setsUseWebviewFalse() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_OPEN_URI_IN_WEBVIEW_KEY, "false")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertFalse(result.getBoolean("use_webview"))
    }

    @Test
    fun whenUseWebviewNotSet_createPushNotificationMap_setsUseWebviewFalse() {
        val bundle = Bundle()
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertFalse(result.getBoolean("use_webview"))
    }

    @Test
    fun whenNoTitleOrContent_createPushNotificationMap_setsSilentTrue() {
        val bundle = Bundle()
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertTrue(result.getBoolean("is_silent"))
    }

    @Test
    fun whenTitleProvided_createPushNotificationMap_setsSilentFalse() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Title")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertFalse(result.getBoolean("is_silent"))
    }

    @Test
    fun whenContentProvided_createPushNotificationMap_setsSilentFalse() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_CONTENT_KEY, "Content")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertFalse(result.getBoolean("is_silent"))
    }

    @Test
    fun whenTimestampProvided_createPushNotificationMap_setsTimestamp() {
        val timestamp = 1234567890000L
        val bundle = Bundle().apply {
            putLong(Constants.BRAZE_PUSH_RECEIVED_TIMESTAMP_MILLIS, timestamp)
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertEquals(timestamp.toDouble(), result.getDouble("timestamp"), 0.0)
    }

    @Test
    fun whenTimestampZero_createPushNotificationMap_doesNotSetTimestamp() {
        val bundle = Bundle().apply {
            putLong(Constants.BRAZE_PUSH_RECEIVED_TIMESTAMP_MILLIS, 0L)
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        // Timestamp should not be set when 0
        assertFalse(result.hasKey("timestamp"))
    }

    @Test
    fun whenCalled_createPushNotificationMap_includesAndroidExtras() {
        val bundle = Bundle().apply {
            putString("custom_key", "custom_value")
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Title")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertTrue(result.hasKey("android"))
        val androidMap = result.getMap("android")
        ktAssertNotNull(androidMap)
    }

    @Test
    fun whenCalled_createPushNotificationMap_includesBrazeProperties() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Title")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertTrue(result.hasKey("braze_properties"))
    }

    @Test
    fun whenNormalPush_createPushNotificationMap_setsIsBrazeInternalFalse() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Title")
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertFalse(result.getBoolean("is_braze_internal"))
    }

    @Test
    fun whenAllFieldsProvided_createPushNotificationMap_setsAllFields() {
        val bundle = Bundle().apply {
            putString(Constants.BRAZE_PUSH_TITLE_KEY, "Full Test Title")
            putString(Constants.BRAZE_PUSH_CONTENT_KEY, "Full Test Body")
            putString(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://full/test")
            putString(Constants.BRAZE_PUSH_SUMMARY_TEXT_KEY, "Full Summary")
            putString(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY, "https://example.com/full.png")
            putString(Constants.BRAZE_PUSH_OPEN_URI_IN_WEBVIEW_KEY, "true")
            putLong(Constants.BRAZE_PUSH_RECEIVED_TIMESTAMP_MILLIS, 9999999999L)
        }
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened",
            rawExtras = bundle
        )

        assertEquals("push_opened", result.getString("payload_type"))
        assertEquals("Full Test Title", result.getString("title"))
        assertEquals("Full Test Body", result.getString("body"))
        assertEquals("myapp://full/test", result.getString("url"))
        assertEquals("Full Summary", result.getString("summary_text"))
        assertEquals("https://example.com/full.png", result.getString("image_url"))
        assertTrue(result.getBoolean("use_webview"))
        assertFalse(result.getBoolean("is_silent"))
        assertFalse(result.getBoolean("is_braze_internal"))
        assertEquals(9999999999.0, result.getDouble("timestamp"), 0.0)
        assertTrue(result.hasKey("android"))
        assertTrue(result.hasKey("braze_properties"))
    }

    @Test
    fun whenEmptyBundle_createPushNotificationMap_returnsMapWithDefaults() {
        val bundle = Bundle()
        val payload = BrazeNotificationPayload(bundle)

        val result = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened"
        )

        assertEquals("push_opened", result.getString("payload_type"))
        assertNull(result.getString("title"))
        assertNull(result.getString("body"))
        assertNull(result.getString("url"))
        assertTrue(result.getBoolean("is_silent"))
        assertFalse(result.getBoolean("use_webview"))
        assertFalse(result.getBoolean("is_braze_internal"))
    }
}
