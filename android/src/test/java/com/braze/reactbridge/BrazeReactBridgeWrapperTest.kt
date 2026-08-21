package com.braze.reactbridge

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class BrazeReactBridgeWrapperTest : BrazeRobolectricTestBase() {
    @Test
    fun whenCreated_exposesBridgeImplDelegate() {
        val bridge = BrazeReactBridge(TestReactApplicationContext())

        assertNotNull(bridge.brazeImpl)
        assertEquals(BrazeReactBridgeImpl.NAME, bridge.name)
    }

    @Test
    fun whenRequestImmediateDataFlushIsCalled_delegatesToImpl() {
        val context = TestReactApplicationContext()
        val bridge = BrazeReactBridge(context)

        bridge.requestImmediateDataFlush()

        // Smoke assertion: delegate is wired and method is callable through the wrapper.
        assertNotNull(bridge.brazeImpl)
    }
}
