package com.braze.reactbridge

import com.braze.models.Banner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.any
import java.lang.reflect.Constructor

class BannerUtilTest {

    /**
     * Create our own constructor for Banner using reflection
     */
    private lateinit var bannerConstructor: Constructor<Banner>

    @Before
    fun setup() {
        bannerConstructor = Banner::class.java.getDeclaredConstructor(
            String::class.java,
            String::class.java,
            String::class.java,
            Boolean::class.javaPrimitiveType,
            Long::class.java,
            Boolean::class.javaPrimitiveType,
            JSONObject::class.java
        )
        bannerConstructor.isAccessible = true
    }

    @Test
    fun whenMapBannerCalled_addBannerPropertiesCorrectly() {
        mockStatic(Arguments::class.java).use { mockedArguments ->
            mockStatic(Class.forName("com.braze.reactbridge.JsonUtilsKt")).use { mockedJsonUtils ->
                mockedArguments.`when`<WritableMap> { Arguments.createMap() }
                    .thenAnswer { JavaOnlyMap() }

                mockedJsonUtils.`when`<ReadableMap> { jsonToNativeMap(any()) }.thenAnswer {
                    JavaOnlyMap().apply {
                        putString("key", "value")
                    }
                }

                val banner = bannerConstructor.newInstance(
                    "track123",
                    "place456",
                    "<div>Banner</div>",
                    true,
                    1234567890L,
                    false,
                    JSONObject("{\"key\":\"value\"}")
                )

                val result = mapBanner(banner)

                assertEquals("track123", result.getString("trackingId"))
                assertEquals("place456", result.getString("placementId"))
                assertFalse(result.getBoolean("isTestSend"))
                assertTrue(result.getBoolean("isControl"))
                assertEquals("<div>Banner</div>", result.getString("html"))
                assertEquals(1234567890L, result.getLong("expiresAt"))

                val kvp = result.getMap("properties")
                ktAssertNotNull(kvp)
                assertEquals("value", kvp.getString("key"))
            }
        }
    }

    @Test
    fun whenMapBannersCalled_addBannerPropertiesCorrectly() {
        mockStatic(Arguments::class.java).use { mockedArguments ->
            mockStatic(Class.forName("com.braze.reactbridge.JsonUtilsKt")).use { mockedJsonUtils ->
                mockedArguments.`when`<WritableArray> { Arguments.createArray() }.thenAnswer {
                    JavaOnlyArray()
                }
                mockedArguments.`when`<WritableMap> { Arguments.createMap() }.thenAnswer {
                    JavaOnlyMap()
                }
                mockedJsonUtils.`when`<ReadableMap> { jsonToNativeMap(any()) }.thenAnswer {
                    JavaOnlyMap().apply {
                        putString("key", "value")
                    }
                }

                val banner1 = bannerConstructor.newInstance(
                    "trackA",
                    "placeA",
                    "<div>A</div>",
                    true,
                    100L,
                    false,
                    JSONObject("{\"key\":\"value\"}")
                )

                val banner2 = bannerConstructor.newInstance(
                    "trackB",
                    "placeB",
                    "<div>B</div>",
                    false,
                    200L,
                    true,
                    JSONObject("{\"key\":\"value\"}")
                )

                val result: WritableArray = mapBanners(listOf(banner1, banner2))

                // Verify mapping for first banner
                val map1 = result.getMap(0)
                ktAssertNotNull(map1)
                assertEquals("trackA", map1.getString("trackingId"))
                assertEquals("placeA", map1.getString("placementId"))
                assertFalse(map1.getBoolean("isTestSend"))
                assertTrue(map1.getBoolean("isControl"))
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
                assertTrue(map2.getBoolean("isTestSend"))
                assertFalse(map2.getBoolean("isControl"))
                assertEquals("<div>B</div>", map2.getString("html"))
                assertEquals(200.0, map2.getDouble("expiresAt"), 0.001)

                val kvp2 = map2.getMap("properties")
                ktAssertNotNull(kvp2)
                assertEquals("value", kvp2.getString("key"))
            }
        }
    }
}
