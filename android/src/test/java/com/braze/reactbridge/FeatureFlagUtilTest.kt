package com.braze.reactbridge

import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_BOOLEAN
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_DATETIME
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_IMAGE
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_JSON
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_NUMBER
import com.braze.models.IPropertiesObject.Companion.PROPERTIES_TYPE_STRING
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FeatureFlagUtilTest : BrazeRobolectricTestBase() {
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
                "type" to PROPERTIES_TYPE_STRING,
                "value" to testString
            ),
            "num_prop" to mapOf(
                "type" to PROPERTIES_TYPE_NUMBER,
                "value" to testNumber
            ),
            "bool_prop" to mapOf(
                "type" to PROPERTIES_TYPE_BOOLEAN,
                "value" to testBoolean
            ),
            "ts_prop" to mapOf(
                "type" to PROPERTIES_TYPE_DATETIME,
                "value" to testTimestamp
            ),
            "img_prop" to mapOf(
                "type" to PROPERTIES_TYPE_IMAGE,
                "value" to testImageUrl
            ),
            "json_prop" to mapOf(
                "type" to PROPERTIES_TYPE_JSON,
                "value" to testInnerJsonString
            )
        )
    ).toString()

    @Test
    fun internalFeatureFlagConstructor_createsFeatureFlag() {
        val testId = "ff1"
        val testPropertiesJson = JSONObject(
            mapOf(
                "key" to "value",
                "number" to 123
            )
        ).toString()
        val ff = createFeatureFlag(testId, true, testPropertiesJson, "fTS")

        ktAssertNotNull(ff)
        assertEquals(testId, ff.id)
        assertEquals(true, ff.enabled)
        assertEquals("value", ff.properties.getString("key"))
        assertEquals(123, ff.properties.getInt("number"))
    }

    @Test
    fun convertFeatureFlag_convertsCorrectly_withProps() {
        val ff = createFeatureFlag(testId, true, propertiesJson)
        val result = convertFeatureFlag(ff)

        assertEquals(testId, result.getString("id"))
        assertTrue(result.getBoolean("enabled"))

        val resultProperties = result.getMap("properties")
        ktAssertNotNull(resultProperties)

        // String
        val strMap = resultProperties.getMap("str_prop")
        ktAssertNotNull(strMap)
        assertEquals(PROPERTIES_TYPE_STRING, strMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
        assertEquals(testString, strMap.getString(FEATURE_FLAG_PROPERTIES_VALUE))

        // Number
        val numMap = resultProperties.getMap("num_prop")
        ktAssertNotNull(numMap)
        assertEquals(PROPERTIES_TYPE_NUMBER, numMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
        assertEquals(testNumber, numMap.getDouble(FEATURE_FLAG_PROPERTIES_VALUE), 0.001)

        // Boolean
        val boolMap = resultProperties.getMap("bool_prop")
        ktAssertNotNull(boolMap)
        assertEquals(PROPERTIES_TYPE_BOOLEAN, boolMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
        assertTrue(boolMap.getBoolean(FEATURE_FLAG_PROPERTIES_VALUE))

        // Timestamp
        val tsMap = resultProperties.getMap("ts_prop")
        ktAssertNotNull(tsMap)
        assertEquals(PROPERTIES_TYPE_DATETIME, tsMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
        assertEquals(
            testTimestamp.toDouble(),
            tsMap.getDouble(FEATURE_FLAG_PROPERTIES_VALUE),
            0.001
        )

        // Image
        val imgMap = resultProperties.getMap("img_prop")
        ktAssertNotNull(imgMap)
        assertEquals(PROPERTIES_TYPE_IMAGE, imgMap.getString(FEATURE_FLAG_PROPERTIES_TYPE))
        assertEquals(testImageUrl, imgMap.getString(FEATURE_FLAG_PROPERTIES_VALUE))

        // JSON
        val jsonMap = resultProperties.getMap("json_prop")
        ktAssertNotNull(jsonMap)
        val innerJsonMap = jsonMap.getMap(FEATURE_FLAG_PROPERTIES_VALUE)
        ktAssertNotNull(innerJsonMap)
        assertEquals(PROPERTIES_TYPE_JSON, jsonMap.getString("type"))
        assertEquals("nested_value", innerJsonMap.getString("nested_key"))
    }
}
