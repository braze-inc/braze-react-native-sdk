package com.braze.reactbridge

import com.braze.reactbridge.util.getMutableArray
import com.braze.reactbridge.util.getMutableMap
import com.braze.reactbridge.util.setShouldUseJavaMapForMapFactory
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MapFactoryTest : BrazeRobolectricTestBase() {
    @Test
    fun whenShouldUseJavaMapIsDisabled_getMutableMap_returnsNativeMap() {
        setShouldUseJavaMapForMapFactory(false)
        var throwable: Throwable? = null

        // React seems to throw a different throwable type here, so we catch Throwable
        try {
            getMutableMap()
        } catch (e: Throwable) {
            throwable = e
        }

        ktAssertNotNull(throwable)
    }

    @Test
    fun whenShouldUseJavaMapIsDisabled_getMutableArray_returnsNativeArray() {
        setShouldUseJavaMapForMapFactory(false)
        var throwable: Throwable? = null

        // React seems to throw a different throwable type here, so we catch Throwable
        try {
            getMutableArray()
        } catch (e: Throwable) {
            throwable = e
        }

        ktAssertNotNull(throwable)
    }

    @Test
    fun whenShouldUseJavaMapIsEnabled_getMutableMap_returnsJavaOnlyMap() {
        setShouldUseJavaMapForMapFactory(true)

        val map = getMutableMap()

        assertTrue(map is JavaOnlyMap)
        map.putString("key", "value")
        assertEquals("value", map.getString("key"))
    }

    @Test
    fun whenShouldUseJavaMapIsEnabled_getMutableArray_returnsJavaOnlyArray() {
        setShouldUseJavaMapForMapFactory(true)

        val array = getMutableArray()

        assertTrue(array is JavaOnlyArray)
        array.pushString("item")
        assertEquals("item", array.getString(0))
    }
}
