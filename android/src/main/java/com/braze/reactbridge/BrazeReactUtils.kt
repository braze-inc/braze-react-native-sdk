package com.braze.reactbridge

import android.content.Intent
import com.braze.models.push.BrazeNotificationPayload
import com.braze.push.BrazeNotificationUtils.isBrazePushMessage
import com.braze.support.BrazeLogger.brazelog
import com.facebook.react.bridge.WritableMap

/**
 * Utility class for React Native Braze integration.
 * Provides functionality to capture initial push notification payloads
 * when the app is launched from a terminated state.
 *
 * This mirrors the functionality of BrazeReactUtils on iOS.
 */
object BrazeReactUtils {
    private var initialPushPayload: WritableMap? = null

    /**
     * Call this method in your MainActivity's onCreate() to capture the push notification
     * payload when the app is launched from a terminated state via a push notification.
     *
     * Example usage in MainActivity.kt:
     * ```
     * import com.braze.reactbridge.BrazeReactUtils
     *
     * class MainActivity : ReactActivity() {
     *     override fun onCreate(savedInstanceState: Bundle?) {
     *         super.onCreate(savedInstanceState)
     *         BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)
     *     }
     * }
     * ```
     *
     * @param intent The intent from MainActivity.onCreate()
     */
    @JvmStatic
    fun populateInitialPushPayloadFromIntent(intent: Intent?) {
        if (intent == null) {
            brazelog { "populateInitialPushPayloadFromIntent called with null intent" }
            return
        }

        val extras = intent.extras
        if (extras == null || !intent.isBrazePushMessage()) {
            brazelog { "Intent does not contain Braze push data, not setting initial push payload" }
            initialPushPayload = null
            return
        }

        // Create BrazeNotificationPayload from the Intent extras
        val payload = BrazeNotificationPayload(extras)

        // Use Intent.data as the deep link if available (takes priority over extras)
        val deepLinkOverride = intent.data?.toString()

        initialPushPayload = PushPayloadMapper.createPushNotificationMap(
            payload = payload,
            payloadType = "push_opened",
            deepLinkOverride = deepLinkOverride,
            rawExtras = extras
        )
        brazelog { "Initial Android push payload set: $initialPushPayload" }
    }

    /**
     * Returns the initial push notification payload if the app was launched
     * from a push notification while in a terminated state.
     *
     * @return The push payload as a WritableMap, or null if not available
     */
    @JvmStatic
    fun getInitialPushPayload(): WritableMap? {
        return initialPushPayload
    }

    /**
     * Clears the stored initial push payload.
     * Called after the payload has been retrieved to prevent duplicate handling.
     */
    @JvmStatic
    fun clearInitialPushPayload() {
        initialPushPayload = null
    }
}
