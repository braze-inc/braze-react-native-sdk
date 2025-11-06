package com.braze.reactbridge

import com.braze.reactbridge.util.setShouldUseJavaMapForMapFactory
import org.junit.Before
import org.junit.Ignore
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Ignore("Base class for Robolectric tests has no tests")
@Config(
    sdk = [33]
)
open class BrazeRobolectricTestBase {
    @Before
    fun setupMapFactory() {
        setShouldUseJavaMapForMapFactory(true)
    }
}
