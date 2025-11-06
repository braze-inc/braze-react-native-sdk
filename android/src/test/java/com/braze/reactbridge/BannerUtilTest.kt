package com.braze.reactbridge

import com.facebook.react.bridge.WritableArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Test

class BannerUtilTest : BrazeRobolectricTestBase() {
    @Test
    fun whenCalled_mapBanner_addsFieldsAndPropertiesCorrectly() {
        val isTestSend = getRandomBoolean()
        val isControl = getRandomBoolean()
        val banner = createBanner(
            trackingId = "track123",
            placementId = "place456",
            html = "<div>Banner</div>",
            isTestSend = isTestSend,
            expirationTimestampSeconds = 1234567890L,
            isControl = isControl,
            properties = JSONObject(mapOf("key" to "value"))
        )

        val result = mapBanner(banner)

        assertEquals("track123", result.getString("trackingId"))
        assertEquals("place456", result.getString("placementId"))
        assertEquals(isTestSend, result.getBoolean("isTestSend"))
        assertEquals(isControl, result.getBoolean("isControl"))
        assertEquals("<div>Banner</div>", result.getString("html"))
        assertEquals(1234567890L, result.getLong("expiresAt"))

        val kvp = result.getMap("properties")
        ktAssertNotNull(kvp)
        assertEquals("value", kvp.getString("key"))
    }

    @Test
    fun whenCalled_mapBanners_addsFieldsAndPropertiesCorrectly() {
        val isTestSend = getRandomBoolean()
        val isControl = getRandomBoolean()

        val banner1 = createBanner(
            trackingId = "trackA",
            placementId = "placeA",
            html = "<div>A</div>",
            isTestSend = isTestSend,
            expirationTimestampSeconds = 100L,
            isControl = isControl,
            properties = JSONObject(mapOf("key" to "value"))
        )

        val banner2 = createBanner(
            trackingId = "trackB",
            placementId = "placeB",
            html = "<div>B</div>",
            isTestSend = isTestSend,
            expirationTimestampSeconds = 200L,
            isControl = isControl,
            properties = JSONObject(mapOf("key" to "value"))
        )

        val result: WritableArray = mapBanners(listOf(banner1, banner2))

        // Verify mapping for first banner
        val map1 = result.getMap(0)
        ktAssertNotNull(map1)
        assertEquals("trackA", map1.getString("trackingId"))
        assertEquals("placeA", map1.getString("placementId"))
        assertEquals(isTestSend, map1.getBoolean("isTestSend"))
        assertEquals(isControl, map1.getBoolean("isControl"))
        assertEquals("<div>A</div>", map1.getString("html"))
        assertEquals(100.0, map1.getDouble("expiresAt"), 0.001)

        val kvp1 = map1.getMap("properties")
        ktAssertNotNull(kvp1)
        assertEquals("value", kvp1.getString("key"))

        // Verify mapping for second banner
        val map2 = result.getMap(1)
        ktAssertNotNull(map2)
        assertEquals("trackB", map2.getString("trackingId"))
        assertEquals("placeB", map2.getString("placementId"))
        assertEquals(isTestSend, map2.getBoolean("isTestSend"))
        assertEquals(isControl, map2.getBoolean("isControl"))
        assertEquals("<div>B</div>", map2.getString("html"))
        assertEquals(200.0, map2.getDouble("expiresAt"), 0.001)

        val kvp2 = map2.getMap("properties")
        ktAssertNotNull(kvp2)
        assertEquals("value", kvp2.getString("key"))
    }
}
