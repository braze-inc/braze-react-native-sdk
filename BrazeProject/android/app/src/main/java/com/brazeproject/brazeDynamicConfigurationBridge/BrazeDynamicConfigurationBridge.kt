package com.brazeproject.brazeDynamicConfigurationBridge

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.brazeproject.braze.BrazeDynamicConfiguration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class BrazeDynamicConfigurationBridge internal constructor(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "BrazeDynamicConfigurationBridge"
    }

    @ReactMethod
    fun saveConfig(config: ReadableMap, promise: Promise) {
        try {
            val brazeDynamicConfiguration = BrazeDynamicConfiguration.sharedInstance
                ?: throw IllegalStateException("No shared instance for BrazeDynamicConfiguration")

            brazeDynamicConfiguration.saveConfig(config)

            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }

    @ReactMethod
    fun initializeWithSavedConfig(promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val brazeDynamicConfiguration = BrazeDynamicConfiguration.sharedInstance
                    ?: throw IllegalStateException("No shared instance for BrazeDynamicConfiguration")

                brazeDynamicConfiguration.initializeWithSavedConfig()

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("Error", e)
            }
        }
    }
}