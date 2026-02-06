package com.braze.reactbridge

import android.content.Intent
import android.net.Uri
import com.braze.Constants
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class BrazeReactUtilsTest : BrazeRobolectricTestBase() {

    @After
    fun tearDown() {
        // Clear state between tests
        BrazeReactUtils.clearInitialPushPayload()
    }

    @Test
    fun whenCalledWithNullIntent_populateInitialPushPayloadFromIntent_doesNotSetPayload() {
        BrazeReactUtils.populateInitialPushPayloadFromIntent(null)

        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenCalledWithIntentWithNoExtras_populateInitialPushPayloadFromIntent_doesNotSetPayload() {
        val intent = Intent()

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenCalledWithNonBrazeIntent_populateInitialPushPayloadFromIntent_doesNotSetPayload() {
        val intent = Intent().apply {
            putExtra("some_random_key", "some_value")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenCalledWithBrazePushTitle_populateInitialPushPayloadFromIntent_setsPayload() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Test Title")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("Test Title", payload.getString("title"))
        assertEquals("push_opened", payload.getString("payload_type"))
    }

    @Test
    fun whenCalledWithBrazePushContent_populateInitialPushPayloadFromIntent_setsPayload() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_CONTENT_KEY, "Test Body")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("Test Body", payload.getString("body"))
    }

    @Test
    fun whenCalledWithBrazeDeepLink_populateInitialPushPayloadFromIntent_setsUrl() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://test/deeplink")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Test")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("myapp://test/deeplink", payload.getString("url"))
    }

    @Test
    fun whenCalledWithIntentData_populateInitialPushPayloadFromIntent_usesIntentDataAsUrl() {
        val intent = Intent().apply {
            data = Uri.parse("myapp://from/intent/data")
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://from/extras")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Test")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        // Intent.data should take priority over extras
        assertEquals("myapp://from/intent/data", payload.getString("url"))
    }

    @Test
    fun whenCalledWithIntentDataAndBrazeSource_populateInitialPushPayloadFromIntent_setsPayload() {
        val intent = Intent().apply {
            data = Uri.parse("myapp://test")
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra("source", "braze")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("myapp://test", payload.getString("url"))
    }

    @Test
    fun whenCalledWithFullPushData_populateInitialPushPayloadFromIntent_setsAllFields() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Test Title")
            putExtra(Constants.BRAZE_PUSH_CONTENT_KEY, "Test Body")
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://test")
            putExtra(Constants.BRAZE_PUSH_SUMMARY_TEXT_KEY, "Summary")
            putExtra(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY, "https://example.com/image.png")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("push_opened", payload.getString("payload_type"))
        assertEquals("Test Title", payload.getString("title"))
        assertEquals("Test Body", payload.getString("body"))
        assertEquals("myapp://test", payload.getString("url"))
        assertEquals("Summary", payload.getString("summary_text"))
        assertEquals("https://example.com/image.png", payload.getString("image_url"))
    }

    @Test
    fun whenCalled_getInitialPushPayload_returnsStoredPayload() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Test")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()

        ktAssertNotNull(payload)
    }

    @Test
    fun whenNoPayloadSet_getInitialPushPayload_returnsNull() {
        val payload = BrazeReactUtils.getInitialPushPayload()

        assertNull(payload)
    }

    @Test
    fun whenCalled_clearInitialPushPayload_clearsStoredPayload() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Test")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)
        ktAssertNotNull(BrazeReactUtils.getInitialPushPayload())

        BrazeReactUtils.clearInitialPushPayload()

        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenCalledMultipleTimes_clearInitialPushPayload_doesNotThrow() {
        BrazeReactUtils.clearInitialPushPayload()
        BrazeReactUtils.clearInitialPushPayload()
        BrazeReactUtils.clearInitialPushPayload()

        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenCalledWithNewIntent_populateInitialPushPayloadFromIntent_overwritesPreviousPayload() {
        val intent1 = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "First Title")
        }
        val intent2 = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Second Title")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent1)
        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent2)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("Second Title", payload.getString("title"))
    }

    @Test
    fun whenCalledWithSilentPush_populateInitialPushPayloadFromIntent_setsSilentFlag() {
        // Silent push has deep link but no title/content
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://silent")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals(true, payload.getBoolean("is_silent"))
    }

    @Test
    fun whenCalledWithTitleAndContent_populateInitialPushPayloadFromIntent_setsNotSilent() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Title")
            putExtra(Constants.BRAZE_PUSH_CONTENT_KEY, "Content")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals(false, payload.getBoolean("is_silent"))
    }
}
