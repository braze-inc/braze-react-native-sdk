package com.braze.reactbridge

import android.content.Intent
import android.net.Uri
import com.braze.Constants
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class BrazeReactUtilsTest : BrazeRobolectricTestBase() {

    @After
    fun tearDown() {
        BrazeReactUtils.clearInitialPushPayload()
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
        assertEquals("myapp://from/intent/data", payload.getString("url"))
    }

    @Test
    fun whenCalledWithIntentDataAndBrazeSource_populateInitialPushPayloadFromIntent_setsPayload() {
        val intent = Intent().apply {
            data = Uri.parse("myapp://test")
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra("source", Constants.BRAZE_INTENT_SOURCE)
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
    fun whenCalledWithSilentPush_populateInitialPushPayloadFromIntent_setsSilentFlag() {
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

    @Test
    fun whenCalledWithNewBrazePushIntent_populateInitialPushPayloadFromIntent_overwritesPreviousPayload() {
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
    fun whenCalledWithBrazeRoutedActionViewIntent_populateInitialPushPayloadFromIntent_setsPayloadFromDeepLink() {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("myapp://deep/link")).apply {
            putExtra("source", Constants.BRAZE_INTENT_SOURCE)
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("myapp://deep/link", payload.getString("url"))
        assertEquals("push_opened", payload.getString("payload_type"))
    }

    @Test
    fun whenCalledWithBrazeRoutedIntentWithDeepLinkInExtras_populateInitialPushPayloadFromIntent_setsPayload() {
        val intent = Intent().apply {
            putExtra("source", Constants.BRAZE_INTENT_SOURCE)
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://extras/link")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("myapp://extras/link", payload.getString("url"))
    }

    @Test
    fun whenCalledWithBrazeRoutedIntentWithBothDataAndExtras_populateInitialPushPayloadFromIntent_prefersIntentData() {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("myapp://from/data")).apply {
            putExtra("source", Constants.BRAZE_INTENT_SOURCE)
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://from/extras")
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("myapp://from/data", payload.getString("url"))
    }

    @Test
    fun whenCalledWithBrazeSourceButNoDeepLink_populateInitialPushPayloadFromIntent_doesNotSetPayload() {
        val intent = Intent().apply {
            putExtra("source", Constants.BRAZE_INTENT_SOURCE)
        }

        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenCalledWithLauncherIntent_populateInitialPushPayloadFromIntent_clearsExistingPayload() {
        val pushIntent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Test")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(pushIntent)
        assertNotNull(BrazeReactUtils.getInitialPushPayload())

        val launcherIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(launcherIntent)

        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenCalledWithUnknownIntent_populateInitialPushPayloadFromIntent_preservesExistingPayload() {
        val pushIntent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Preserved")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(pushIntent)
        assertNotNull(BrazeReactUtils.getInitialPushPayload())

        val unknownIntent = Intent().apply {
            putExtra("some_random_key", "some_value")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(unknownIntent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("Preserved", payload.getString("title"))
    }

    @Test
    fun whenCalledWithActionMainWithoutLauncherCategory_populateInitialPushPayloadFromIntent_preservesPayload() {
        val pushIntent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Preserved")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(pushIntent)
        assertNotNull(BrazeReactUtils.getInitialPushPayload())

        val mainIntent = Intent(Intent.ACTION_MAIN)
        BrazeReactUtils.populateInitialPushPayloadFromIntent(mainIntent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("Preserved", payload.getString("title"))
    }

    @Test
    fun whenEmptyActionViewThenBrazeRoutedActionView_populateInitialPushPayload_setsPayloadFromSecondIntent() {
        val emptyActionView = Intent(Intent.ACTION_VIEW)
        BrazeReactUtils.populateInitialPushPayloadFromIntent(emptyActionView)
        assertNull(BrazeReactUtils.getInitialPushPayload())

        val brazeActionView = Intent(Intent.ACTION_VIEW, Uri.parse("myapp://push/link")).apply {
            putExtra("source", Constants.BRAZE_INTENT_SOURCE)
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(brazeActionView)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("myapp://push/link", payload.getString("url"))
    }

    @Test
    fun whenBrazeRoutedActionViewThenEmptyActionView_populateInitialPushPayload_preservesPayloadFromFirstIntent() {
        val brazeActionView = Intent(Intent.ACTION_VIEW, Uri.parse("myapp://push/link")).apply {
            putExtra("source", Constants.BRAZE_INTENT_SOURCE)
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(brazeActionView)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("myapp://push/link", payload.getString("url"))

        val emptyActionView = Intent(Intent.ACTION_VIEW)
        BrazeReactUtils.populateInitialPushPayloadFromIntent(emptyActionView)

        val preservedPayload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(preservedPayload)
        assertEquals("myapp://push/link", preservedPayload.getString("url"))
    }

    @Test
    fun whenEmptyActionViewThenBrazePushIntent_populateInitialPushPayloadFromIntent_setsPayloadFromSecondIntent() {
        val emptyActionView = Intent(Intent.ACTION_VIEW)
        BrazeReactUtils.populateInitialPushPayloadFromIntent(emptyActionView)
        assertNull(BrazeReactUtils.getInitialPushPayload())

        val pushIntent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "From Push")
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://push/link")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(pushIntent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("From Push", payload.getString("title"))
        assertEquals("myapp://push/link", payload.getString("url"))
    }

    @Test
    fun whenBrazePushIntentThenEmptyActionView_populateInitialPushPayloadFromIntent_preservesPayloadFromFirstIntent() {
        val pushIntent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "From Push")
            putExtra(Constants.BRAZE_PUSH_DEEP_LINK_KEY, "myapp://push/link")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(pushIntent)

        val payload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(payload)
        assertEquals("From Push", payload.getString("title"))

        val emptyActionView = Intent(Intent.ACTION_VIEW)
        BrazeReactUtils.populateInitialPushPayloadFromIntent(emptyActionView)

        val preservedPayload = BrazeReactUtils.getInitialPushPayload()
        ktAssertNotNull(preservedPayload)
        assertEquals("From Push", preservedPayload.getString("title"))
    }
}
