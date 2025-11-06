package com.braze.reactbridge

import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class JsonUtilsTest : BrazeRobolectricTestBase() {

    @Test
    fun whenCalled_toNativeMap_convertsAllDataTypesCorrectly() {
        val jsonObject = JSONObject().apply {
            put("stringKey", "stringValue")
            put("intKey", 42)
            put("doubleKey", 3.14)
            put("booleanKey", true)
            put("nullKey", JSONObject.NULL)
            put("nestedObject", JSONObject().apply {
                put("nestedString", "nestedValue")
            })
            put("nestedArray", JSONArray().apply {
                put("arrayItem1")
                put("arrayItem2")
            })
        }

        val result = jsonObject.toNativeMap()

        assertEquals("stringValue", result.getString("stringKey"))
        assertEquals(42, result.getInt("intKey"))
        assertEquals(3.14, result.getDouble("doubleKey"), 0.001)
        assertEquals(true, result.getBoolean("booleanKey"))
        assertTrue(result.isNull("nullKey"))

        val nestedObject = result.getMap("nestedObject")
        ktAssertNotNull(nestedObject)
        assertEquals("nestedValue", nestedObject.getString("nestedString"))

        val nestedArray = result.getArray("nestedArray")
        ktAssertNotNull(nestedArray)
        assertEquals(2, nestedArray.size())
        assertEquals("arrayItem1", nestedArray.getString(0))
        assertEquals("arrayItem2", nestedArray.getString(1))
    }

    @Test
    fun whenCalledWithNull_toNativeMap_returnsEmptyMap() {
        val jsonObject: JSONObject? = null

        val result = jsonObject.toNativeMap()

        ktAssertNotNull(result)
        // The map should be empty - check by converting to HashMap
        val hashMap = result.toHashMap()
        assertEquals(0, hashMap.size)
    }

    @Test
    fun whenCalled_toNativeArray_convertsAllDataTypesCorrectly() {
        val jsonArray = JSONArray().apply {
            put("stringValue")
            put(42)
            put(3.14)
            put(true)
            put(JSONObject.NULL)
            put(JSONObject().apply {
                put("key", "value")
            })
            put(JSONArray().apply {
                put("nestedItem")
            })
        }

        val result = jsonArray.toNativeArray()

        assertEquals(7, result.size())
        assertEquals("stringValue", result.getString(0))
        assertEquals(42, result.getInt(1))
        assertEquals(3.14, result.getDouble(2), 0.001)
        assertEquals(true, result.getBoolean(3))
        assertTrue(result.isNull(4))

        val nestedObject = result.getMap(5)
        ktAssertNotNull(nestedObject)
        assertEquals("value", nestedObject.getString("key"))

        val nestedArray = result.getArray(6)
        ktAssertNotNull(nestedArray)
        assertEquals(1, nestedArray.size())
        assertEquals("nestedItem", nestedArray.getString(0))
    }

    @Test
    fun whenCalledWithNull_toNativeArray_returnsEmptyArray() {
        val jsonArray: JSONArray? = null

        val result = jsonArray.toNativeArray()

        ktAssertNotNull(result)
        assertEquals(0, result.size())
    }

    @Test
    fun whenCalled_formatToCamelCase_convertsSnakeCaseKeysToCamelCase() {
        val jsonObject = JSONObject().apply {
            put("is_test_send", true)
            put("placement_id", "place123")
            put("expiration_timestamp", 123456)
            put("has_multiple_words_here", "value")
        }

        val result = jsonObject.formatToCamelCase()

        assertEquals(true, result.getBoolean("isTestSend"))
        assertEquals("place123", result.getString("placementId"))
        assertEquals(123456, result.getInt("expirationTimestamp"))
        assertEquals("value", result.getString("hasMultipleWordsHere"))
    }

    @Test
    fun whenCalledWithKeysToPreserve_formatToCamelCase_preservesSpecifiedKeys() {
        val jsonObject = JSONObject().apply {
            put("extras", JSONObject().apply {
                put("custom_key", "customValue")
            })
            put("is_test_send", true)
            put("placement_id", "place123")
        }

        val result = jsonObject.formatToCamelCase(
            keysToPreserve = listOf("extras")
        )

        // "extras" should be preserved as-is
        val extras = result.getMap("extras")
        ktAssertNotNull(extras)

        // Other keys should be converted to camelCase
        assertEquals(true, result.getBoolean("isTestSend"))
        assertEquals("place123", result.getString("placementId"))
    }

    @Test
    fun whenCalledWithSpecialCases_formatToCamelCase_usesSpecialCaseMapping() {
        val jsonObject = JSONObject().apply {
            put("url", "https://example.com")
            put("use_webview", true)
            put("type", "banner")
            put("normal_key", "normalValue")
        }

        val specialCases = mapOf(
            "url" to "uri",
            "use_webview" to "useWebView",
            "type" to "messageType"
        )

        val result = jsonObject.formatToCamelCase(specialCases = specialCases)

        assertEquals("https://example.com", result.getString("uri"))
        assertEquals(true, result.getBoolean("useWebView"))
        assertEquals("banner", result.getString("messageType"))
        assertEquals("normalValue", result.getString("normalKey"))
    }

    @Test
    fun whenCalledWithNestedObjects_formatToCamelCase_convertsNestedKeys() {
        val jsonObject = JSONObject().apply {
            put("outer_key", "outerValue")
            put("nested_object", JSONObject().apply {
                put("inner_key", "innerValue")
                put("another_inner_key", 123)
            })
        }

        val result = jsonObject.formatToCamelCase()

        assertEquals("outerValue", result.getString("outerKey"))

        val nestedObject = result.getMap("nestedObject")
        ktAssertNotNull(nestedObject)
        assertEquals("innerValue", nestedObject.getString("innerKey"))
        assertEquals(123, nestedObject.getInt("anotherInnerKey"))
    }

    @Test
    fun whenCalledWithNestedArrays_formatToCamelCase_convertsKeysInArrayObjects() {
        val jsonObject = JSONObject().apply {
            put("items_array", JSONArray().apply {
                put(JSONObject().apply {
                    put("item_name", "item1")
                    put("item_count", 5)
                })
                put(JSONObject().apply {
                    put("item_name", "item2")
                    put("item_count", 10)
                })
            })
        }

        val result = jsonObject.formatToCamelCase()

        val itemsArray = result.getArray("itemsArray")
        ktAssertNotNull(itemsArray)
        assertEquals(2, itemsArray.size())

        val firstItem = itemsArray.getMap(0)
        ktAssertNotNull(firstItem)
        assertEquals("item1", firstItem.getString("itemName"))
        assertEquals(5, firstItem.getInt("itemCount"))

        val secondItem = itemsArray.getMap(1)
        ktAssertNotNull(secondItem)
        assertEquals("item2", secondItem.getString("itemName"))
        assertEquals(10, secondItem.getInt("itemCount"))
    }

    @Test
    fun whenCalledWithMixedTypes_formatToCamelCase_handlesAllTypes() {
        val jsonObject = JSONObject().apply {
            put("string_field", "test")
            put("int_field", 42)
            put("double_field", 3.14)
            put("boolean_field", true)
            put("null_field", JSONObject.NULL)
        }

        val result = jsonObject.formatToCamelCase()

        assertEquals("test", result.getString("stringField"))
        assertEquals(42, result.getInt("intField"))
        assertEquals(3.14, result.getDouble("doubleField"), 0.001)
        assertEquals(true, result.getBoolean("booleanField"))
        assertTrue(result.isNull("nullField"))
    }

    @Test
    fun whenCalledWithSingleWordKey_formatToCamelCase_keepsKeyUnchanged() {
        val jsonObject = JSONObject().apply {
            put("simple", "value")
            put("another", 123)
        }

        val result = jsonObject.formatToCamelCase()

        assertEquals("value", result.getString("simple"))
        assertEquals(123, result.getInt("another"))
    }

    @Test
    fun whenCalledWithLongValues_toNativeMap_convertsLongCorrectly() {
        val jsonObject = JSONObject().apply {
            put("longValue", 9223372036854775807L) // Long.MAX_VALUE
            put("normalInt", 42)
            put("timestamp", 1234567890000L)
        }

        val result = jsonObject.toNativeMap()

        // Longs should be stored as Long and accessible via getLong
        assertEquals(9223372036854775807L, result.getLong("longValue"))
        assertEquals(42, result.getInt("normalInt"))
        assertEquals(1234567890000L, result.getLong("timestamp"))
    }

    @Test
    fun whenCalledWithLongValues_toNativeArray_convertsLongCorrectly() {
        val jsonArray = JSONArray().apply {
            put(42) // Int
            put(9223372036854775807L) // Long.MAX_VALUE
            put(1234567890000L) // Timestamp
            put(3.14) // Double
        }

        val result = jsonArray.toNativeArray()

        assertEquals(4, result.size())
        assertEquals(42, result.getInt(0))
        assertEquals(9223372036854775807L, result.getLong(1))
        assertEquals(1234567890000L, result.getLong(2))
        assertEquals(3.14, result.getDouble(3), 0.001)
    }

    @Test
    fun whenCalledWithLongValues_formatToCamelCase_convertsLongCorrectly() {
        val jsonObject = JSONObject().apply {
            put("expiration_timestamp", 1234567890000L)
            put("user_id", 999999999999L)
            put("normal_count", 42)
        }

        val result = jsonObject.formatToCamelCase()

        assertEquals(1234567890000L, result.getLong("expirationTimestamp"))
        assertEquals(999999999999L, result.getLong("userId"))
        assertEquals(42, result.getInt("normalCount"))
    }

    @Test
    fun whenCalledWithNestedLongValues_formatToCamelCase_convertsNestedLongs() {
        val jsonObject = JSONObject().apply {
            put("outer_timestamp", 1000000000000L)
            put("nested_object", JSONObject().apply {
                put("inner_timestamp", 2000000000000L)
                put("inner_count", 123)
            })
            put("array_with_longs", JSONArray().apply {
                put(JSONObject().apply {
                    put("item_timestamp", 3000000000000L)
                })
            })
        }

        val result = jsonObject.formatToCamelCase()

        assertEquals(1000000000000L, result.getLong("outerTimestamp"))

        val nestedObject = result.getMap("nestedObject")
        ktAssertNotNull(nestedObject)
        assertEquals(2000000000000L, nestedObject.getLong("innerTimestamp"))
        assertEquals(123, nestedObject.getInt("innerCount"))

        val arrayWithLongs = result.getArray("arrayWithLongs")
        ktAssertNotNull(arrayWithLongs)
        val firstItem = arrayWithLongs.getMap(0)
        ktAssertNotNull(firstItem)
        assertEquals(3000000000000L, firstItem.getLong("itemTimestamp"))
    }

    @Test
    fun whenCalledWithMixedIntAndLong_toNativeMap_handlesBothCorrectly() {
        val jsonObject = JSONObject().apply {
            put("smallInt", 100)
            put("mediumInt", 50000)
            put("largeInt", 2147483647) // Int.MAX_VALUE
            put("smallLong", 2147483648L) // Int.MAX_VALUE + 1
            put("largeLong", 9223372036854775807L) // Long.MAX_VALUE
        }

        val result = jsonObject.toNativeMap()

        assertEquals(100, result.getInt("smallInt"))
        assertEquals(50000, result.getInt("mediumInt"))
        assertEquals(2147483647, result.getInt("largeInt"))
        assertEquals(2147483648L, result.getLong("smallLong"))
        assertEquals(9223372036854775807L, result.getLong("largeLong"))
    }

    @Test
    fun whenCalledWithAllTypes_toNativeMap_handlesEachTypeCorrectly() {
        val jsonObject = JSONObject().apply {
            put("stringType", "test string")
            put("intType", 42)
            put("longType", 9876543210L)
            put("doubleType", 3.14159)
            put("booleanType", true)
            put("nullType", JSONObject.NULL)
            put("objectType", JSONObject().apply {
                put("nested", "value")
            })
            put("arrayType", JSONArray().apply {
                put("item1")
                put("item2")
            })
        }

        val result = jsonObject.toNativeMap()

        // Test each type
        assertEquals("test string", result.getString("stringType"))
        assertEquals(42, result.getInt("intType"))
        assertEquals(9876543210L, result.getLong("longType"))
        assertEquals(3.14159, result.getDouble("doubleType"), 0.00001)
        assertEquals(true, result.getBoolean("booleanType"))
        assertTrue(result.isNull("nullType"))

        val nestedObject = result.getMap("objectType")
        ktAssertNotNull(nestedObject)
        assertEquals("value", nestedObject.getString("nested"))

        val array = result.getArray("arrayType")
        ktAssertNotNull(array)
        assertEquals(2, array.size())
        assertEquals("item1", array.getString(0))
        assertEquals("item2", array.getString(1))
    }

    @Test
    fun whenCalledWithAllTypes_toNativeArray_handlesEachTypeCorrectly() {
        val jsonArray = JSONArray().apply {
            put("string")
            put(42) // Int
            put(9876543210L) // Long
            put(3.14) // Double
            put(true) // Boolean
            put(JSONObject.NULL) // Null
            put(JSONObject().apply {
                put("key", "value")
            })
            put(JSONArray().apply {
                put("nested")
            })
        }

        val result = jsonArray.toNativeArray()

        assertEquals(8, result.size())
        assertEquals("string", result.getString(0))
        assertEquals(42, result.getInt(1))
        assertEquals(9876543210L, result.getLong(2))
        assertEquals(3.14, result.getDouble(3), 0.001)
        assertEquals(true, result.getBoolean(4))
        assertTrue(result.isNull(5))

        val nestedObject = result.getMap(6)
        ktAssertNotNull(nestedObject)
        assertEquals("value", nestedObject.getString("key"))

        val nestedArray = result.getArray(7)
        ktAssertNotNull(nestedArray)
        assertEquals(1, nestedArray.size())
        assertEquals("nested", nestedArray.getString(0))
    }

    @Test
    fun whenCalledWithAllTypes_formatToCamelCase_handlesEachTypeCorrectly() {
        val jsonObject = JSONObject().apply {
            put("string_field", "test")
            put("int_field", 42)
            put("long_field", 9876543210L)
            put("double_field", 3.14)
            put("boolean_field", true)
            put("null_field", JSONObject.NULL)
            put("object_field", JSONObject().apply {
                put("nested_key", "nested_value")
            })
            put("array_field", JSONArray().apply {
                put("item")
            })
        }

        val result = jsonObject.formatToCamelCase()

        assertEquals("test", result.getString("stringField"))
        assertEquals(42, result.getInt("intField"))
        assertEquals(9876543210L, result.getLong("longField"))
        assertEquals(3.14, result.getDouble("doubleField"), 0.001)
        assertEquals(true, result.getBoolean("booleanField"))
        assertTrue(result.isNull("nullField"))

        val nestedObject = result.getMap("objectField")
        ktAssertNotNull(nestedObject)
        assertEquals("nested_value", nestedObject.getString("nestedKey"))

        val array = result.getArray("arrayField")
        ktAssertNotNull(array)
        assertEquals(1, array.size())
        assertEquals("item", array.getString(0))
    }
}
