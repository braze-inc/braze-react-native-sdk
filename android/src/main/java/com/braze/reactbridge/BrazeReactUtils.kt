package com.braze.reactbridge

import android.content.Intent
import android.os.Bundle
import com.braze.Constants
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
    private const val PUSH_OPENED_PAYLOAD_TYPE = "push_opened"
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
        val payload = BrazeNotificationPayload(extras ?: Bundle())
        val isBrazeRouted = extras?.getString("source") == Constants.BRAZE_INTENT_SOURCE
        val deepLink = intent.data?.toString() ?: payload.deeplink
        val isLauncherIntent = intent.action == Intent.ACTION_MAIN
            && intent.hasCategory(Intent.CATEGORY_LAUNCHER)

        when {
            // Primary path: full Braze push intent with all notification data
            extras != null && intent.isBrazePushMessage() -> {
                initialPushPayload = PushPayloadMapper.createPushNotificationMap(
                    payload = payload,
                    payloadType = PUSH_OPENED_PAYLOAD_TYPE,
                    deepLinkOverride = intent.data?.toString(),
                    rawExtras = extras
                )
                brazelog { "Initial Android push payload set from Braze push intent: $initialPushPayload" }
            }

            // Fallback path: ACTION_VIEW intent from routeUserWithNotificationOpenedIntent -> gotoUri.
            // The full notification extras are lost, but the deep link URL and source marker survive.
            isBrazeRouted && deepLink != null -> {
                initialPushPayload = PushPayloadMapper.createPushNotificationMap(
                    payload = payload,
                    payloadType = PUSH_OPENED_PAYLOAD_TYPE,
                    deepLinkOverride = deepLink,
                    rawExtras = extras ?: Bundle()
                )
                brazelog { "Initial Android push payload set from Braze-routed deep link intent: $initialPushPayload" }
            }

            // Clear on standard launcher intents (user opened app normally, not from push).
            // getInitialPushPayload() also auto-clears on the JS side after reading,
            // but this acts as a safety net for stale data.
            isLauncherIntent -> {
                brazelog { "Launcher intent detected, clearing initial push payload" }
                initialPushPayload = null
            }

            // For all other intents (Activity recreation, config change, etc.),
            // leave the existing payload untouched.
            else -> {
                brazelog {
                    "Intent does not contain Braze push data, leaving initial push payload unchanged." +
                        " Intent: action=${intent.action}, data=${intent.data}, extras=${intent.extras}"
                }
            }
        }
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
