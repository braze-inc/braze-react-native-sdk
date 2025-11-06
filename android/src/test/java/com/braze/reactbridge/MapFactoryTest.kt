package com.braze.reactbridge

import com.braze.reactbridge.util.getMutableArray
import com.braze.reactbridge.util.getMutableMap
import com.braze.reactbridge.util.setShouldUseJavaMapForMapFactory
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
}
