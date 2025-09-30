package com.braze.reactbridge

import com.braze.models.FeatureFlag
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.any
import org.robolectric.RobolectricTestRunner
import java.lang.reflect.Constructor

@RunWith(RobolectricTestRunner::class)
class FeatureFlagUtilTest {
    /**
     * Create our own constructor for FeatureFlag using reflection
     */
    private lateinit var featureFlagConstructor: Constructor<FeatureFlag>

    @Before
    fun setup() {
        featureFlagConstructor = FeatureFlag::class.java.getDeclaredConstructor(
            String::class.java,
            Boolean::class.javaPrimitiveType,
            String::class.java,
            String::class.java
        )
        featureFlagConstructor.isAccessible = true
    }

    /**
     * Test feature flag data
     */
    val testId = "all_types_ff"
    val testString = "test_string_value"
    val testNumber = 123.45
    val testBoolean = true
    val testTimestamp = 1678886400000L
    val testImageUrl = "https://example.com/image.jpg"
    val testInnerJsonString = JSONObject(mapOf("nested_key" to "nested_value"))
    val propertiesJson = JSONObject(
        mapOf(
            "str_prop" to mapOf(
                "type" to "string",
                "value" to testString
            ),
            "num_prop" to mapOf(
                "type" to "number",
                "value" to testNumber
            ),
            "bool_prop" to mapOf(
                "type" to "boolean",
                "value" to testBoolean
            ),
            "ts_prop" to mapOf(
                "type" to "datetime",
                "value" to testTimestamp
            ),
            "img_prop" to mapOf(
                "type" to "image",
                "value" to testImageUrl
            ),
            "json_prop" to mapOf(
                "type" to "jsonobject",
                "value" to testInnerJsonString
            )
        )
    ).toString()

    /**
     * Helper function to create new feature flag instance
     */
    private fun createFeatureFlag(
        id: String,
        enabled: Boolean,
        propertiesJson: String,
        trackingString: String? = null
    ): FeatureFlag {
        return featureFlagConstructor.newInstance(
            id, enabled, propertiesJson, trackingString
        ) as FeatureFlag
    }

    @Test
    fun internalFeatureFlagConstructor_createsFeatureFlag() {
        val testId = "ff1"
        val testPropertiesJson = """{"key": "value", "number": 123}"""
        val ff = createFeatureFlag(testId, true, testPropertiesJson, "fTS")

        assertNotNull(ff)
        assertEquals(testId, ff.id)
        assertEquals(true, ff.enabled)
        assertEquals("value", ff.properties.getString("key"))
        assertEquals(123, ff.properties.getInt("number"))
    }

    @Test
    fun convertFeatureFlag_convertsCorrectly_withProps() {
        val ff = createFeatureFlag(testId, true, propertiesJson)

        // Necessary to mock Arguments and JsonUtils here to prevent errors with NativeLoader
        mockStatic(Arguments::class.java).use { mockedArguments ->
            mockStatic(
                Class.forName("com.braze.reactbridge.JsonUtilsKt")
            ).use { mockedJsonUtils ->
                mockedArguments.`when`<WritableMap> { Arguments.createMap() }
                    .thenAnswer { JavaOnlyMap() }

                val mockNestedJsonMap = JavaOnlyMap().apply {
                    putString("nested_key", "nested_value")
                }
                mockedJsonUtils.`when`<ReadableMap> { jsonToNativeMap(any()) }
                    .thenReturn(mockNestedJsonMap)

                // Call convertFeatureFlag
                val result = convertFeatureFlag(ff)

                assertEquals(testId, result.getString("id"))
                assertTrue(result.getBoolean("enabled"))

                val resultProperties = result.getMap("properties")
                ktAssertNotNull(resultProperties)

                // String
                val strMap = resultProperties.getMap("str_prop")
                ktAssertNotNull(strMap)
                assertEquals(FEATURE_FLAG_PROPERTIES_TYPE_STRING, strMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
                assertEquals(testString, strMap.getString(FEATURE_FLAG_PROPERTIES_VALUE))

                // Number
                val numMap = resultProperties.getMap("num_prop")
                ktAssertNotNull(numMap)
                assertEquals(FEATURE_FLAG_PROPERTIES_TYPE_NUMBER, numMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
                assertEquals(testNumber, numMap.getDouble(FEATURE_FLAG_PROPERTIES_VALUE), 0.001)

                // Boolean
                val boolMap = resultProperties.getMap("bool_prop")
                ktAssertNotNull(boolMap)
                assertEquals(FEATURE_FLAG_PROPERTIES_TYPE_BOOLEAN, boolMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
                assertTrue(boolMap.getBoolean(FEATURE_FLAG_PROPERTIES_VALUE))

                // Timestamp
                val tsMap = resultProperties.getMap("ts_prop")
                ktAssertNotNull(tsMap)
                assertEquals(FEATURE_FLAG_PROPERTIES_TYPE_TIMESTAMP, tsMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
                assertEquals(testTimestamp.toDouble(), tsMap.getDouble(FEATURE_FLAG_PROPERTIES_VALUE), 0.001)

                // Image
                val imgMap = resultProperties.getMap("img_prop")
                ktAssertNotNull(imgMap)
                assertEquals(FEATURE_FLAG_PROPERTIES_TYPE_IMAGE, imgMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
                assertEquals(testImageUrl, imgMap.getString(FEATURE_FLAG_PROPERTIES_VALUE))

                // JSON
                val jsonMap = resultProperties.getMap("json_prop")
                ktAssertNotNull(jsonMap)
                val innerJsonMap = jsonMap.getMap(FEATURE_FLAG_PROPERTIES_VALUE)
                ktAssertNotNull(innerJsonMap)
                assertEquals("jsonobject", jsonMap.getString("type"))
                assertEquals("nested_value", innerJsonMap.getString("nested_key"))
            }
        }
    }
}
