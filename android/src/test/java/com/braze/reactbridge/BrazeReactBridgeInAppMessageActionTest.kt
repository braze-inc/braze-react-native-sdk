package com.braze.reactbridge

import android.app.Activity
import android.net.Uri
import android.os.Handler
import android.os.Looper.getMainLooper
import com.braze.Braze
import com.braze.configuration.BrazeConfig
import com.braze.enums.inappmessage.ClickAction
import com.braze.models.inappmessage.IInAppMessage
import com.braze.models.inappmessage.InAppMessageImmersiveBase
import com.braze.models.inappmessage.MessageButton
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.spy
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.robolectric.Robolectric
import org.robolectric.Shadows.shadowOf
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

class BrazeReactBridgeInAppMessageActionTest : BrazeRobolectricTestBase() {
    private lateinit var reactContext: TestReactApplicationContext
    private lateinit var activity: Activity
    private lateinit var bridge: BrazeReactBridgeImpl

    @Before
    fun setUp() {
        reactContext = TestReactApplicationContext()
        val brazeConfig = BrazeConfig.Builder()
            .setApiKey("test-api-key")
            .build()
        Braze.configure(reactContext, brazeConfig)
        activity = Robolectric.buildActivity(Activity::class.java).setup().get()
        bridge = BrazeReactBridgeImpl(reactContext, activity)
    }

    @Test
    fun whenPerformInAppMessageAction_withMessageUriClick_deserializesMessage() {
        val messageJson = """{"message":"test"}"""
        val mockMessage = mock<IInAppMessage> {
            on { clickAction } doReturn ClickAction.URI
            on { uri } doReturn Uri.parse("https://example.com/deeplink")
            on { openUriInWebView } doReturn true
            on { extras } doReturn emptyMap()
        }
        val brazeMock = mock<Braze> {
            on { deserializeInAppMessageString(messageJson) } doReturn mockMessage
        }
        bridge.brazeTestingMock = brazeMock

        bridge.performInAppMessageAction(messageJson, -1)

        verify(brazeMock).deserializeInAppMessageString(messageJson)
    }

    @Test
    fun whenPerformInAppMessageAction_withButtonClick_deserializesImmersiveMessage() {
        val messageJson = """{"message":"immersive"}"""
        val button = mock<MessageButton> {
            on { id } doReturn 2
            on { clickAction } doReturn ClickAction.URI
            on { uri } doReturn Uri.parse("https://example.com/button")
            on { openUriInWebview } doReturn false
        }
        val mockMessage = mock<InAppMessageImmersiveBase> {
            on { messageButtons } doReturn listOf(button)
            on { extras } doReturn emptyMap()
        }
        val brazeMock = mock<Braze> {
            on { deserializeInAppMessageString(messageJson) } doReturn mockMessage
        }
        bridge.brazeTestingMock = brazeMock

        bridge.performInAppMessageAction(messageJson, 2)

        verify(brazeMock).deserializeInAppMessageString(messageJson)
    }

    @Test
    fun whenPerformInAppMessageAction_withoutActivity_deserializesButDoesNotExecuteAction() {
        val messageJson = """{"message":"test"}"""
        val mockMessage = mock<IInAppMessage> {
            on { clickAction } doReturn ClickAction.URI
            on { uri } doReturn Uri.parse("https://example.com/deeplink")
            on { openUriInWebView } doReturn true
            on { extras } doReturn emptyMap()
        }
        val brazeMock = mock<Braze> {
            on { deserializeInAppMessageString(messageJson) } doReturn mockMessage
        }
        val nullActivityBridge = BrazeReactBridgeImpl(reactContext, currentActivity = null)
        nullActivityBridge.brazeTestingMock = brazeMock

        nullActivityBridge.performInAppMessageAction(messageJson, -1)

        verify(brazeMock).deserializeInAppMessageString(messageJson)
        verify(mockMessage, never()).clickAction
    }

    @Test
    fun whenPerformInAppMessageAction_withNullMessage_completesWithoutError() {
        val messageJson = """{"message":"missing"}"""
        val brazeMock = mock<Braze> {
            on { deserializeInAppMessageString(messageJson) } doReturn null
        }
        bridge.brazeTestingMock = brazeMock

        bridge.performInAppMessageAction(messageJson, -1)

        verify(brazeMock).deserializeInAppMessageString(messageJson)
    }

    /**
     * Regression for https://github.com/braze-inc/braze-react-native-sdk/issues/330:
     * NativeModules invokes bridge methods off the main thread, but
     * [Activity.requestPermissions] must run on the main thread.
     */
    @Test
    fun whenRequestPushPermissionCalledFromBackground_runsPromptOnMainThread() {
        val realActivity = Robolectric.buildActivity(Activity::class.java).setup().get()
        realActivity.applicationInfo.targetSdkVersion = 33
        val activity = spy(realActivity)

        val promptThread = AtomicReference<Thread>()
        val promptRan = CountDownLatch(1)
        doAnswer { invocation ->
            val action = invocation.getArgument<Runnable>(0)
            // Mirror Activity.runOnUiThread posting semantics and record the thread.
            Handler(getMainLooper()).post {
                promptThread.set(Thread.currentThread())
                try {
                    action.run()
                } finally {
                    promptRan.countDown()
                }
            }
            null
        }.whenever(activity).runOnUiThread(any())

        val bridge = BrazeReactBridgeImpl(reactContext, activity)
        val calledFromMain = AtomicBoolean(true)
        val backgroundCallFinished = CountDownLatch(1)
        Thread({
            calledFromMain.set(Thread.currentThread() == getMainLooper().thread)
            bridge.requestPushPermission(null)
            backgroundCallFinished.countDown()
        }, "NativeModules").start()

        assertTrue(backgroundCallFinished.await(2, TimeUnit.SECONDS))
        assertFalse(
            "Precondition: call must come from a background thread (NativeModules)",
            calledFromMain.get(),
        )
        verify(activity).runOnUiThread(any())

        shadowOf(getMainLooper()).idle()
        assertTrue(promptRan.await(2, TimeUnit.SECONDS))
        assertEquals(
            "requestPushPermissionPrompt must run on the main thread",
            getMainLooper().thread,
            promptThread.get(),
        )
    }

    @Test
    fun whenRequestPushPermissionCalledWithNullActivity_doesNothing() {
        val bridge = BrazeReactBridgeImpl(reactContext, currentActivity = null)
        bridge.requestPushPermission(null)
    }
}
