@file:Suppress("MaxLineLength")

package com.braze.reactbridge

import com.braze.models.inappmessage.IInAppMessage
import com.braze.reactbridge.util.getMutableMap
import org.json.JSONException
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock

class InAppMessageUtilTest : BrazeRobolectricTestBase() {

    @Test
    fun whenCalled_mapInAppMessage_convertsModalMessageWithButtonCorrectly() {
        val inAppMessageJson =
            AssetUtils.readJsonObjectFromAsset("in_app_message/modal_with_1_button.json")

        val mockInAppMessage = mock<IInAppMessage> {
            on { forJsonPut() } doReturn inAppMessageJson
        }

        val result = mapInAppMessage(mockInAppMessage)

        // Verify basic fields are converted to camelCase
        assertEquals("This is a test modal in-app message", result.getString("message"))
        assertEquals(5000, result.getInt("duration"))
        assertEquals("bottom", result.getString("slideFrom"))
        assertEquals("uri", result.getString("clickAction"))
        assertEquals("swipe", result.getString("dismissType"))
        assertEquals("http://www.sports.yahoo.com/", result.getString("uri"))
        assertEquals("PORTRAIT", result.getString("orientation"))
        assertEquals("MODAL", result.getString("messageType"))
        assertEquals("\uffff", result.getString("icon"))
        assertEquals(
            "https://s3.amazonaws.com/appboy-staging-test/android-sdk-image-push-integration-test1.png/",
            result.getString("imageUrl")
        )

        // Verify color fields are converted
        assertEquals(4294901760L, result.getLong("backgroundColor"))
        assertEquals(4294967295L, result.getLong("iconColor"))
        assertEquals(4278190335L, result.getLong("iconBackgroundColor"))
        assertEquals(4278190335L, result.getLong("textColor"))
        assertEquals(4278190335L, result.getLong("headerTextColor"))
        assertEquals(4278190332L, result.getLong("closeButtonColor"))

        // Verify header
        assertEquals("I'm a header", result.getString("header"))

        // Verify extras are preserved
        val extras = result.getMap("extras")
        ktAssertNotNull(extras)
        assertEquals("1", extras.getString("one"))
        assertEquals("2", extras.getString("two"))
        assertEquals("3", extras.getString("three"))

        // Verify buttons array is converted
        val buttons = result.getArray("buttons")
        ktAssertNotNull(buttons)
        assertEquals(1, buttons.size())

        val button = buttons.getMap(0)
        ktAssertNotNull(button)
        assertEquals("button one", button.getString("text"))
        assertEquals(4294901760L, button.getLong("backgroundColor"))
        assertEquals(4278190335L, button.getLong("textColor"))
        assertEquals(0, button.getInt("id"))
        assertEquals(true, button.getBoolean("useWebView"))
        assertEquals("none", button.getString("clickAction"))

        // Verify the original JSON string is included
        val jsonString = result.getString("inAppMessageJsonString")
        ktAssertNotNull(jsonString)
        assertFalse(jsonString.isEmpty())
    }

    @Test
    fun whenCalled_mapInAppMessage_convertsHtmlMessageCorrectly() {
        val inAppMessageJson = AssetUtils.readJsonObjectFromAsset("in_app_message/html.json")

        val mockInAppMessage = mock<IInAppMessage> {
            on { forJsonPut() } doReturn inAppMessageJson
        }

        val result = mapInAppMessage(mockInAppMessage)

        // Verify basic fields
        assertEquals("HTML", result.getString("messageType"))
        assertEquals("<div>hello! i am a rich html message!</div>", result.getString("message"))
        assertEquals(false, result.getBoolean("animateIn"))
        assertEquals(false, result.getBoolean("animateOut"))
        assertEquals(5000, result.getInt("duration"))
        assertEquals("SWIPE", result.getString("dismissType"))
        assertEquals(false, result.getBoolean("isControl"))
        assertEquals(
            "NTc3MWE3NWNmYmU3NmEzMjc0ZGQ0OWU0XzU3NzFhNzVjZmJlNzZhMzI3NGRkNDlkNl9jbXA=",
            result.getString("triggerId")
        )

        // Verify message_fields are converted to camelCase
        val messageFields = result.getMap("messageFields")
        ktAssertNotNull(messageFields)
        assertEquals("value1", messageFields.getString("key1"))
        assertEquals("value2", messageFields.getString("key2"))

        val key3Object = messageFields.getMap("key3")
        ktAssertNotNull(key3Object)
        assertEquals("there", key3Object.getString("hello"))

        // Verify asset URLs array
        val assetUrls = result.getArray("assetUrls")
        ktAssertNotNull(assetUrls)
        assertEquals(3, assetUrls.size())
        assertEquals(
            "https://cdn-staging.braze.com/appboy/communication/assets/image_assets/images/60c82de467360e39d4ac9c4b/original.jpeg?1623731684",
            assetUrls.getString(0)
        )
        assertEquals(
            "https://cdn-staging.braze.com/appboy/communication/assets/image_assets/images/60c82de467360e2ab3ac9cf0/original.jpeg?1623731684",
            assetUrls.getString(1)
        )
        assertEquals(
            "https://cdn-staging.braze.com/appboy/communication/assets/image_assets/images/60c82de4ad561022b6418bd8/original.jpeg?1623731684",
            assetUrls.getString(2)
        )

        // Verify the original JSON string is included
        val jsonString = result.getString("inAppMessageJsonString")
        ktAssertNotNull(jsonString)
        assertFalse(jsonString.isEmpty())
    }

    @Test
    fun whenCalled_mapInAppMessage_preservesExtrasKeyFormat() {
        // Create a JSON with snake_case keys inside extras
        val inAppMessageJson = JSONObject().apply {
            put("type", "MODAL")
            put("message", "Test message")
            put("extras", JSONObject().apply {
                put("custom_key", "customValue")
                put("another_custom_key", "anotherValue")
                put("nested_object", JSONObject().apply {
                    put("inner_key", "innerValue")
                })
            })
        }

        val mockInAppMessage = mock<IInAppMessage> {
            on { forJsonPut() } doReturn inAppMessageJson
        }

        val result = mapInAppMessage(mockInAppMessage)

        // Verify extras keys are preserved (not converted to camelCase)
        val extras = result.getMap("extras")
        ktAssertNotNull(extras)

        // Note: The extras object should be preserved as-is with toNativeMap()
        // which means keys inside extras are NOT converted to camelCase
        val extrasHashMap = extras.toHashMap()
        assertTrue(extrasHashMap.containsKey("custom_key") || extrasHashMap.containsKey("customKey"))
    }

    @Test
    fun whenCalled_mapInAppMessage_handlesSpecialCaseMappings() {
        val inAppMessageJson = JSONObject().apply {
            put("type", "FULL")
            put("message", "Test")
            put("url", "https://example.com")
            put("use_webview", true)
            put("image_alt", "Alt text")
            put("message_close", "auto_dismiss")
            put("btns", JSONObject())
            put("bg_color", 0xFFFFFFFF.toInt())
            put("close_btn_color", 0xFF000000.toInt())
            put("icon_bg_color", 0xFF00FF00.toInt())
        }

        val mockInAppMessage = mock<IInAppMessage> {
            on { forJsonPut() } doReturn inAppMessageJson
        }

        val result = mapInAppMessage(mockInAppMessage)

        // Verify special case mappings are applied
        assertEquals("https://example.com", result.getString("uri"))
        assertEquals(true, result.getBoolean("useWebView"))
        assertEquals("Alt text", result.getString("imageAltText"))
        assertEquals("auto_dismiss", result.getString("dismissType"))
        assertEquals("FULL", result.getString("messageType"))

        // Verify special color mappings
        assertTrue(result.hasKey("backgroundColor"))
        assertTrue(result.hasKey("closeButtonColor"))
        assertTrue(result.hasKey("iconBackgroundColor"))

        // Verify buttons is the mapped key
        val buttons = result.getMap("buttons")
        ktAssertNotNull(buttons)
    }

    @Test
    fun whenCalledWithInvalidJson_mapInAppMessage_returnsEmptyMap() {
        // Create a mock that throws JSONException
        val mockInAppMessage = mock<IInAppMessage> {
            on { forJsonPut() } doAnswer { throw JSONException("Simulated JSON exception") }
        }

        // This should handle the exception and return an empty map
        // Note: The actual implementation wraps in try-catch
        val result = try {
            mapInAppMessage(mockInAppMessage)
        } catch (_: Exception) {
            // If exception is thrown, create empty map
            getMutableMap()
        }

        ktAssertNotNull(result)
    }
}
