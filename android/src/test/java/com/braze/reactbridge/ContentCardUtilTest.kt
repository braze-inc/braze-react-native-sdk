@file:Suppress("LongMethod")

package com.braze.reactbridge

import com.braze.enums.CardType
import com.braze.models.cards.CaptionedImageCard
import com.braze.models.cards.Card
import com.braze.models.cards.ImageOnlyCard
import com.braze.models.cards.ShortNewsCard
import com.braze.models.cards.TextAnnouncementCard
import com.facebook.react.bridge.WritableArray
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock

class ContentCardUtilTest : BrazeRobolectricTestBase() {
    @Test
    fun whenCalled_mapContentCard_addsFieldsAndExtrasCorrectly() {
        val mockCard = mock<Card> {
            on { id } doReturn "card123"
            on { created } doReturn 1234567890L
            on { expiresAt } doReturn 9876543210L
            on { viewed } doReturn true
            on { isClicked } doReturn false
            on { isPinned } doReturn true
            on { isDismissed } doReturn false
            on { isDismissibleByUser } doReturn true
            on { url } doReturn "https://example.com"
            on { openUriInWebView } doReturn false
            on { isControl } doReturn false
            on { cardType } doReturn CardType.DEFAULT
            on { extras } doReturn mapOf("key1" to "value1", "key2" to "value2")
        }

        val result = mapContentCard(mockCard)

        assertEquals("card123", result.getString("id"))
        assertEquals(1234567890.0, result.getDouble("created"), 0.001)
        assertEquals(9876543210.0, result.getDouble("expiresAt"), 0.001)
        assertTrue(result.getBoolean("viewed"))
        assertFalse(result.getBoolean("clicked"))
        assertTrue(result.getBoolean("pinned"))
        assertFalse(result.getBoolean("dismissed"))
        assertTrue(result.getBoolean("dismissible"))
        assertEquals("https://example.com", result.getString("url"))
        assertFalse(result.getBoolean("openURLInWebView"))
        assertFalse(result.getBoolean("isControl"))

        val extras = result.getMap("extras")
        ktAssertNotNull(extras)
        assertEquals("value1", extras.getString("key1"))
        assertEquals("value2", extras.getString("key2"))
    }

    @Test
    fun whenCalled_mapContentCards_addsFieldsAndExtrasCorrectly() {
        val mockCard1 = mock<Card> {
            on { id } doReturn "cardA"
            on { created } doReturn 100L
            on { expiresAt } doReturn 200L
            on { viewed } doReturn true
            on { isClicked } doReturn false
            on { isPinned } doReturn true
            on { isDismissed } doReturn false
            on { isDismissibleByUser } doReturn true
            on { url } doReturn "https://example.com/a"
            on { openUriInWebView } doReturn false
            on { isControl } doReturn false
            on { cardType } doReturn CardType.DEFAULT
            on { extras } doReturn mapOf("key" to "value")
        }

        val mockCard2 = mock<Card> {
            on { id } doReturn "cardB"
            on { created } doReturn 300L
            on { expiresAt } doReturn 400L
            on { viewed } doReturn false
            on { isClicked } doReturn true
            on { isPinned } doReturn false
            on { isDismissed } doReturn true
            on { isDismissibleByUser } doReturn false
            on { url } doReturn "https://example.com/b"
            on { openUriInWebView } doReturn true
            on { isControl } doReturn true
            on { cardType } doReturn CardType.DEFAULT
            on { extras } doReturn mapOf("key" to "value")
        }

        val result: WritableArray = mapContentCards(listOf(mockCard1, mockCard2))

        // Verify mapping for first card
        val map1 = result.getMap(0)
        ktAssertNotNull(map1)
        assertEquals("cardA", map1.getString("id"))
        assertEquals(100.0, map1.getDouble("created"), 0.001)
        assertEquals(200.0, map1.getDouble("expiresAt"), 0.001)
        assertTrue(map1.getBoolean("viewed"))
        assertFalse(map1.getBoolean("clicked"))
        assertTrue(map1.getBoolean("pinned"))
        assertFalse(map1.getBoolean("dismissed"))
        assertTrue(map1.getBoolean("dismissible"))
        assertEquals("https://example.com/a", map1.getString("url"))
        assertFalse(map1.getBoolean("openURLInWebView"))
        assertFalse(map1.getBoolean("isControl"))

        val extras1 = map1.getMap("extras")
        ktAssertNotNull(extras1)
        assertEquals("value", extras1.getString("key"))

        // Verify mapping for second card
        val map2 = result.getMap(1)
        ktAssertNotNull(map2)
        assertEquals("cardB", map2.getString("id"))
        assertEquals(300.0, map2.getDouble("created"), 0.001)
        assertEquals(400.0, map2.getDouble("expiresAt"), 0.001)
        assertFalse(map2.getBoolean("viewed"))
        assertTrue(map2.getBoolean("clicked"))
        assertFalse(map2.getBoolean("pinned"))
        assertTrue(map2.getBoolean("dismissed"))
        assertFalse(map2.getBoolean("dismissible"))
        assertEquals("https://example.com/b", map2.getString("url"))
        assertTrue(map2.getBoolean("openURLInWebView"))
        assertTrue(map2.getBoolean("isControl"))

        val extras2 = map2.getMap("extras")
        ktAssertNotNull(extras2)
        assertEquals("value", extras2.getString("key"))
    }

    @Test
    fun whenCalled_captionedImageCardToWritableMap_addsFieldsCorrectly() {
        val mockCard = mock<CaptionedImageCard> {
            on { imageUrl } doReturn "https://example.com/image.jpg"
            on { aspectRatio } doReturn 1.5f
            on { title } doReturn "Test Title"
            on { description } doReturn "Test Description"
            on { domain } doReturn "example.com"
        }

        val result = mockCard.toWritableMap()

        assertEquals("https://example.com/image.jpg", result.getString("image"))
        assertEquals(1.5, result.getDouble("imageAspectRatio"), 0.001)
        assertEquals("Test Title", result.getString("title"))
        assertEquals("Test Description", result.getString("cardDescription"))
        assertEquals("example.com", result.getString("domain"))
        assertEquals("Captioned", result.getString("type"))
    }

    @Test
    fun whenCalled_shortNewsCardToWritableMap_addsFieldsCorrectly() {
        val mockCard = mock<ShortNewsCard> {
            on { imageUrl } doReturn "https://example.com/news.jpg"
            on { title } doReturn "News Title"
            on { description } doReturn "News Description"
            on { domain } doReturn "news.com"
        }

        val result = mockCard.toWritableMap()

        assertEquals("https://example.com/news.jpg", result.getString("image"))
        assertEquals("News Title", result.getString("title"))
        assertEquals("News Description", result.getString("cardDescription"))
        assertEquals("news.com", result.getString("domain"))
        assertEquals("Classic", result.getString("type"))
    }

    @Test
    fun whenCalled_textAnnouncementCardToWritableMap_addsFieldsCorrectly() {
        val mockCard = mock<TextAnnouncementCard> {
            on { title } doReturn "Announcement Title"
            on { description } doReturn "Announcement Description"
            on { domain } doReturn "announcements.com"
        }

        val result = mockCard.toWritableMap()

        assertEquals("Announcement Title", result.getString("title"))
        assertEquals("Announcement Description", result.getString("cardDescription"))
        assertEquals("announcements.com", result.getString("domain"))
        assertEquals("Classic", result.getString("type"))
    }

    @Test
    fun whenCalled_imageOnlyCardToWritableMap_addsFieldsCorrectly() {
        val mockCard = mock<ImageOnlyCard> {
            on { imageUrl } doReturn "https://example.com/image-only.jpg"
            on { aspectRatio } doReturn 2.0f
        }

        val result = mockCard.toWritableMap()

        assertEquals("https://example.com/image-only.jpg", result.getString("image"))
        assertEquals(2.0, result.getDouble("imageAspectRatio"), 0.001)
        assertEquals("ImageOnly", result.getString("type"))
    }

    @Test
    fun whenCalled_controlCardToWritableMap_addsFieldsCorrectly() {
        val result = controlCardToWritableMap()

        assertEquals("Control", result.getString("type"))
    }

    @Test
    fun whenCalled_mapContentCardWithCaptionedImageCard_mergesCorrectly() {
        val mockCard = mock<CaptionedImageCard> {
            on { id } doReturn "captioned123"
            on { created } doReturn 1234567890L
            on { expiresAt } doReturn 9876543210L
            on { viewed } doReturn true
            on { isClicked } doReturn false
            on { isPinned } doReturn true
            on { isDismissed } doReturn false
            on { isDismissibleByUser } doReturn true
            on { url } doReturn "https://example.com"
            on { openUriInWebView } doReturn false
            on { isControl } doReturn false
            on { cardType } doReturn CardType.CAPTIONED_IMAGE
            on { extras } doReturn mapOf("key" to "value")
            on { imageUrl } doReturn "https://example.com/image.jpg"
            on { aspectRatio } doReturn 1.5f
            on { title } doReturn "Test Title"
            on { description } doReturn "Test Description"
            on { domain } doReturn "example.com"
        }

        val result = mapContentCard(mockCard)

        // Verify base fields
        assertEquals("captioned123", result.getString("id"))
        assertEquals(1234567890.0, result.getDouble("created"), 0.001)
        assertEquals(9876543210.0, result.getDouble("expiresAt"), 0.001)
        assertTrue(result.getBoolean("viewed"))
        assertFalse(result.getBoolean("clicked"))
        assertTrue(result.getBoolean("pinned"))
        assertFalse(result.getBoolean("dismissed"))
        assertTrue(result.getBoolean("dismissible"))
        assertEquals("https://example.com", result.getString("url"))
        assertFalse(result.getBoolean("openURLInWebView"))
        assertFalse(result.getBoolean("isControl"))

        // Verify extras
        val extras = result.getMap("extras")
        ktAssertNotNull(extras)
        assertEquals("value", extras.getString("key"))

        // Verify captioned image specific fields
        assertEquals("https://example.com/image.jpg", result.getString("image"))
        assertEquals(1.5, result.getDouble("imageAspectRatio"), 0.001)
        assertEquals("Test Title", result.getString("title"))
        assertEquals("Test Description", result.getString("cardDescription"))
        assertEquals("example.com", result.getString("domain"))
        assertEquals("Captioned", result.getString("type"))
    }
}
