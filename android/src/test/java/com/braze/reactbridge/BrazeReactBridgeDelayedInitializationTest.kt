package com.braze.reactbridge

import android.app.Activity
import android.os.Looper.getMainLooper
import com.braze.Braze
import com.braze.BrazeActivityLifecycleCallbackListener
import com.braze.events.IEventSubscriber
import com.braze.events.SessionStateChangedEvent
import org.junit.After
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.robolectric.Robolectric
import org.robolectric.Shadows.shadowOf
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.random.Random

/**
 * Regression test for runtime `Braze.initialize()` on Android when delayed initialization
 * is enabled (the default @braze/expo-plugin 5.x path without compile-time API keys).
 */
class BrazeReactBridgeDelayedInitializationTest : BrazeRobolectricTestBase() {
    private lateinit var reactContext: TestReactApplicationContext

    class HostActivity : Activity()

    @Before
    fun setUpDelayedInitScenario() {
        // Step 0: Expo plugin 5.x default — SDK dormant until JS initialize() (no androidApiKey in app.json).
        reactContext = TestReactApplicationContext()
        val appContext = reactContext.applicationContext
        Braze.wipeData(appContext)
        Braze.enableSdk(appContext)
        Braze.enableDelayedInitialization(appContext)
        shadowOf(getMainLooper()).idle()
        assertTrue(
            "Precondition: delayed initialization must be enabled (Expo plugin 5.x default)",
            Braze.isDelayedInitializationEnabled,
        )
    }

    @After
    fun tearDown() {
        val appContext = reactContext.applicationContext
        Braze.wipeData(appContext)
        shadowOf(getMainLooper()).idle()
    }

    /**
     * Reproduces the customer IAM issue:
     * 1. Native activity starts while the SDK waits for JS `Braze.initialize()`.
     * 2. [BrazeActivityLifecycleCallbackListener] runs `openSession`, but delayed init blocks it.
     * 3. JS bridge calls `initialize()` — delayed init is disabled; the bridge must open a session
     *    for the activity that is already in the foreground.
     *
     * Expected: [SessionStateChangedEvent.ChangeType.SESSION_STARTED] fires without background/foreground.
     */
    @Test
    fun whenActivityStartedBeforeRuntimeInitialize_thenInitialize_opensSessionForCurrentActivity() {
        // Step 1: Register lifecycle listener (same as Expo plugin + RN integration).
        val lifecycleListener = BrazeActivityLifecycleCallbackListener()
        val controller = Robolectric.buildActivity(HostActivity::class.java).create()
        val activity = controller.get()
        activity.application.registerActivityLifecycleCallbacks(lifecycleListener)

        // Step 2: First foreground — onActivityStarted → openSession, but delayed init blocks it.
        controller.start()
        shadowOf(getMainLooper()).idle()

        // Step 3: Listen for SESSION_STARTED (proof a Braze session actually opened).
        val sessionStarted = AtomicBoolean(false)
        val sessionSubscriber =
            IEventSubscriber<SessionStateChangedEvent> { event ->
                if (event.eventType == SessionStateChangedEvent.ChangeType.SESSION_STARTED) {
                    sessionStarted.set(true)
                }
            }

        // Step 4: JS runtime init — must open session for the current activity (post-fix).
        val bridge = BrazeReactBridgeImpl(reactContext, activity)
        bridge.initialize(
            "test-api-key-${Random.nextInt()}",
            "sdk.iad-01.braze.com",
        )
        shadowOf(getMainLooper()).idle()

        // Step 5: Delayed init must be off after initialize().
        assertFalse(
            "Delayed initialization must be disabled after Braze.initialize()",
            Braze.isDelayedInitializationEnabled,
        )

        // Step 6: Subscribe on the live Braze instance post-init.
        bridge.braze.subscribeToSessionUpdates(sessionSubscriber)
        shadowOf(getMainLooper()).idle()

        // Step 7: Wait for session
        blockUntil { sessionStarted.get() }

        // Step 8: Session on cold start without background/foreground.
        assertTrue(
            "Braze.initialize() should start a Braze session for the current activity when " +
                "delayed initialization was enabled and onActivityStarted already ran. " +
                "Without this, Android IAM triggers tied to session start will not fire until " +
                "the app is backgrounded and resumed.",
            sessionStarted.get(),
        )

        activity.application.unregisterActivityLifecycleCallbacks(lifecycleListener)
        controller.pause().stop().destroy()
        shadowOf(getMainLooper()).idle()
    }
}
