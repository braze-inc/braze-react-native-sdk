package com.braze.reactbridge

import androidx.test.core.app.ApplicationProvider
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.CatalystInstance
import com.facebook.react.bridge.JavaScriptContextHolder
import com.facebook.react.bridge.JavaScriptModule
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UIManager
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.turbomodule.core.interfaces.CallInvokerHolder
import java.lang.Exception

/**
 * Test [ReactApplicationContext] that captures [RCTDeviceEventEmitter] emissions.
 * Standalone from [TestReactApplicationContext] so existing tests stay unchanged.
 */
@Suppress("TooManyFunctions")
class EventCapturingReactApplicationContext(
    private val eventEmitter: JavaScriptModule,
    private val activeReactInstance: Boolean = true,
) : ReactApplicationContext(ApplicationProvider.getApplicationContext()) {
    override fun <T : JavaScriptModule?> getJSModule(clazz: Class<T?>?): T? {
        if (clazz == DeviceEventManagerModule.RCTDeviceEventEmitter::class.java) {
            @Suppress("UNCHECKED_CAST")
            return eventEmitter as T
        }
        return null
    }

    override fun <T : NativeModule?> hasNativeModule(p0: Class<T?>?): Boolean = false
    override fun getNativeModules(): Collection<NativeModule?>? = null
    override fun <T : NativeModule?> getNativeModule(p0: Class<T?>?): T? = null
    override fun getNativeModule(p0: String?): NativeModule? = null
    override fun getCatalystInstance(): CatalystInstance? = null
    @Deprecated("Deprecated")
    override fun hasActiveCatalystInstance(): Boolean = activeReactInstance
    override fun hasActiveReactInstance(): Boolean = activeReactInstance
    @Deprecated("Deprecated")
    override fun hasCatalystInstance(): Boolean = true
    override fun hasReactInstance(): Boolean = activeReactInstance
    override fun destroy() = Unit
    override fun handleException(p0: Exception?) = Unit
    @Deprecated("Deprecated")
    override fun isBridgeless(): Boolean = false
    override fun getJavaScriptContextHolder(): JavaScriptContextHolder? = null
    override fun getJSCallInvokerHolder(): CallInvokerHolder? = null
    @Deprecated("Deprecated")
    override fun getFabricUIManager(): UIManager? = null
    override fun getSourceURL(): String? = null
    override fun registerSegment(
        p0: Int,
        p1: String?,
        p2: Callback?
    ) = Unit
}
