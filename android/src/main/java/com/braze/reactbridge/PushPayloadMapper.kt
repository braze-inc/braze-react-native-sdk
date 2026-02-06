package com.braze.reactbridge

import android.os.Bundle
import com.braze.Constants
import com.braze.models.push.BrazeNotificationPayload
import com.braze.reactbridge.util.getMutableMap
import com.facebook.react.bridge.WritableMap

/**
 * Utility functions for converting push notification data to React Native format.
 */
object PushPayloadMapper {

    /**
     * Converts a BrazeNotificationPayload to a WritableNativeMap for passing to React Native.
     * This format is consistent across subscribeToPushNotificationEvents and getInitialPushPayload.
     *
     * @param payload The BrazeNotificationPayload to convert
     * @param payloadType The type of push event (e.g., "push_opened", "push_received")
     * @param deepLinkOverride Optional override for the deep link URL (e.g., from Intent.data)
     * @param rawExtras Optional raw extras bundle to use as fallback for reading values
     * @return WritableNativeMap with the push notification data
     */
    @JvmStatic
    fun createPushNotificationMap(
        payload: BrazeNotificationPayload,
        payloadType: String,
        deepLinkOverride: String? = null,
        rawExtras: Bundle? = null
    ): WritableMap {
        return getMutableMap().apply {
            putString("payload_type", payloadType)
            putString("url", deepLinkOverride ?: payload.deeplink)
            putString("title", payload.titleText)
            putString("body", payload.contentText)
            putString("summary_text", payload.summaryText)

            payload.notificationBadgeNumber?.let { putInt("badge_count", it) }

            payload.notificationExtras.getLong(Constants.BRAZE_PUSH_RECEIVED_TIMESTAMP_MILLIS)
                .takeUnless { it == 0L }?.let {
                    // Convert to Double when passing to JS layer since timestamp can't fit in a 32-bit
                    // int and WritableNativeMap doesn't support longs due to language limitations
                    putDouble("timestamp", it.toDouble())
                }

            putBoolean(
                "use_webview",
                payload.notificationExtras.getString(Constants.BRAZE_PUSH_OPEN_URI_IN_WEBVIEW_KEY) == "true"
            )

            putBoolean("is_silent", payload.titleText == null && payload.contentText == null)

            putBoolean(
                "is_braze_internal",
                payload.isUninstallTrackingPush || payload.shouldRefreshFeatureFlags
            )

            // bigImageUrl property doesn't read from notificationExtras, so check multiple sources
            putString(
                "image_url",
                payload.bigImageUrl
                    ?: rawExtras?.getString(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY)
                    ?: payload.brazeExtras.getString(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY)
                    ?: payload.notificationExtras.getString(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY)
            )

            // Include all Android extras for debugging/advanced use
            putMap("android", bundleToMap(payload.notificationExtras))

            // Include Braze properties
            putMap(
                "braze_properties",
                bundleToMap(payload.brazeExtras, setOf(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY))
            )
        }
    }

    /**
     * Converts a Bundle to a WritableMap for passing to React Native.
     * @param bundle The Bundle to convert
     * @param filteringKeys Keys to exclude from the conversion
     * @return A WritableMap containing all Bundle entries as strings
     */
    private fun bundleToMap(bundle: Bundle, filteringKeys: Set<String> = emptySet()): WritableMap {
        return getMutableMap().apply {
            bundle.keySet()
                .filter { !filteringKeys.contains(it) }
                .forEach { key ->
                    @Suppress("DEPRECATION")
                    putString(key, bundle[key]?.toString())
                }
        }
    }
}
