package com.braze.reactbridge

import com.braze.models.inappmessage.IInAppMessage
import com.braze.reactbridge.util.getMutableMap
import com.braze.support.BrazeLogger.Priority.W
import com.braze.support.BrazeLogger.brazelog
import com.braze.support.BrazeLogger.getBrazeLogTag
import com.facebook.react.bridge.WritableMap
import org.json.JSONException
import org.json.JSONObject

private val TAG = "InAppMessageUtil".getBrazeLogTag()

/**
 * Formats a Braze in-app message for consumption in the Javascript layer.
 */
fun mapInAppMessage(inAppMessage: IInAppMessage): WritableMap {
    try {
        val specialCases = mapOf(
            "url" to "uri",
            "use_webview" to "useWebView",
            "image_alt" to "imageAltText",
            "message_close" to "dismissType",
            "type" to "messageType",
            "btns" to "buttons",
            "bg_color" to "backgroundColor",
            "close_btn_color" to "closeButtonColor",
            "icon_bg_color" to "iconBackgroundColor"
        )

        val messageJSON = JSONObject(inAppMessage.forJsonPut().toString())
        val formattedMessageMap = messageJSON.formatToCamelCase(
            keysToPreserve = listOf("extras"),
            specialCases = specialCases
        )
        // Manually add for conversion back from JS -> Android layer
        formattedMessageMap.putString("inAppMessageJsonString", messageJSON.toString())

        return formattedMessageMap
    } catch (e: JSONException) {
        brazelog(TAG, W) { "Unable to parse In-App Message: ${e.message}" }
        return getMutableMap()
    }
}
