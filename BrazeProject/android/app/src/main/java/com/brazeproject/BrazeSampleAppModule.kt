package com.brazeproject

import android.util.Log
import com.braze.Braze
import com.braze.support.BrazeLogger
import com.braze.support.BrazeLogger.brazelog
import com.braze.support.BrazeLogger.Priority.W
import com.braze.support.BrazeLogger.Priority.V
import com.braze.support.BrazeLogger.getBrazeLogTag
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.messaging.FirebaseMessaging

/// Sample-app-only module to re-request an OS push token after unregisterPush().
class BrazeSampleAppModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "BrazeSampleApp"

    @ReactMethod
    fun registerForRemoteNotifications(promise: Promise) {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                Braze.getInstance(reactApplicationContext).registeredPushToken = token
                brazelog(V) { "Updated push token: $token" }
                promise.resolve(null)
            } else {
                val errorMessage =
                    "Failed to register push token. Ensure you are running on a physical device. " +
                        "Error: ${task.exception?.localizedMessage}"
                brazelog(W) { errorMessage }
                promise.reject(
                    "PUSH_REGISTRATION_ERROR",
                    errorMessage,
                    task.exception
                )
            }
        }
    }

    companion object {
        private val TAG = getBrazeLogTag(BrazeSampleAppModule::class.java)
    }
}
