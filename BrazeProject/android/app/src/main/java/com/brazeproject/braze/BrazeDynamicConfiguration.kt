package com.brazeproject.braze

import android.app.Application
import android.content.Context
import com.braze.Braze
import com.braze.BrazeActivityLifecycleCallbackListener
import com.braze.configuration.BrazeConfig
import com.braze.configuration.BrazeConfigurationProvider
import com.braze.support.BrazeLogger
import com.facebook.react.bridge.ReadableMap
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import org.json.JSONObject

data class ConfigData(
    private val _apiKey: String?,
    private val _endpoint: String?,
    private val _logLevel: Int?,
    private val _firebaseCloudMessagingSenderIdKey: String?
) {
    var apiKey: String
    var endpoint: String
    var logLevel: Int
    var firebaseCloudMessagingSenderIdKey: String

    init {
        if (
            _apiKey == null ||
            _endpoint == null ||
            _logLevel == null ||
            _firebaseCloudMessagingSenderIdKey == null
        ) {
            throw IllegalArgumentException(
                "Given config attributes are invalid"
            )
        }

        this.apiKey = _apiKey
        this.endpoint = _endpoint
        this.logLevel = _logLevel
        this.firebaseCloudMessagingSenderIdKey = _firebaseCloudMessagingSenderIdKey
    }

    companion object {
        fun fromJsonString(jsonString: String): ConfigData {
            return with(JSONObject(jsonString)) {
                ConfigData(
                    getString("apiKey"),
                    getString("endpoint"),
                    getInt("logLevel"),
                    getString("firebaseCloudMessagingSenderIdKey")
                )
            }
        }
    }

    fun toJSONString(): String {
        return JSONObject().apply {
            put("apiKey", apiKey)
            put("endpoint", endpoint)
            put("logLevel", logLevel)
            put("firebaseCloudMessagingSenderIdKey", firebaseCloudMessagingSenderIdKey)
        }.toString()
    }
}

const val SAVED_CONFIG_KEY = "braze_saved_config"

class BrazeDynamicConfiguration(private val application: Application) {
    private val sharedPref = application.getSharedPreferences("BrazeDynamicConfiguration", Context.MODE_PRIVATE)

    companion object {
        var sharedInstance: BrazeDynamicConfiguration? = null
    }

    init {
        sharedInstance = this;
    }

    private val activityLifecycleCallbackListener = BrazeActivityLifecycleCallbackListener()

    @Throws
    fun saveConfig(map: ReadableMap) {
        if (sharedPref == null) {
            throw IllegalAccessException(
                "Trying to save into nullish shared preferences"
            )
        }

        val config = with(map) {
            ConfigData(
                getString("apiKey"),
                getString("endpoint"),
                getInt("logLevel"),
                getString("firebaseCloudMessagingSenderIdKey")
            )
        }

        with(sharedPref.edit()) {
            putString(SAVED_CONFIG_KEY, config.toJSONString())
            apply()
        }
    }

    @Throws
    fun getSavedConfig(): ConfigData? {
        if (sharedPref == null) {
            throw IllegalAccessException(
                "Trying to read from nullish shared preferences"
            )
        }

        val jsonString = sharedPref.getString(SAVED_CONFIG_KEY, null)
            ?: return null

        return ConfigData.fromJsonString(jsonString)
    }

    @Throws
    suspend fun initializeWithSavedConfig() {
        val savedConfig = getSavedConfig()
            ?: throw IllegalAccessException(
                "No saved config"
            )

        initialize(savedConfig)
    }

    @Throws
    private suspend fun initialize(config: ConfigData) {
        val configurationProvider = BrazeConfigurationProvider(application);

        val configuredApiKey = Braze.getConfiguredApiKey(configurationProvider);

        // To avoid creating an instance with the same config as the existing one
        if (config.apiKey == configuredApiKey) {
            return;
        }

        /*
            If the api key is configured, then calling "initialize" means changing configurations
            and therefore preparing for creating a new instance
        */
        if (configuredApiKey != null) {
            // Delete previous push token to avoid receiving push notifications originating from previous instance
            FirebaseMessaging.getInstance().deleteToken().await()

            Braze.apply {
                // Wipe all the data created by previous instance, to avoid unexpected behavior of the new instance
                getInstance(application).registeredPushToken = null
                wipeData(application)
            }

            // Unregister previous callback listener to avoid callbacks execution duplications
            application.unregisterActivityLifecycleCallbacks(activityLifecycleCallbackListener)
        }

        BrazeLogger.logLevel = config.logLevel

        val brazeConfig = BrazeConfig.Builder().apply {
            setApiKey(config.apiKey)
            setCustomEndpoint(config.endpoint)
            setAutomaticGeofenceRequestsEnabled(false)
            setIsLocationCollectionEnabled(true)
            setTriggerActionMinimumTimeIntervalSeconds(1)
            setHandlePushDeepLinksAutomatically(true)
        }.build()

        application.registerActivityLifecycleCallbacks(activityLifecycleCallbackListener)

        Braze.apply {
            configure(application, brazeConfig)
            // Need to enable the new instance after wiping up the data
            enableSdk(application)

            /*
                Creating new push token: get token creates a new one if the previous one is deleted
            */
            val newToken = FirebaseMessaging.getInstance().token.await()

            getInstance(application).apply {
                registeredPushToken = newToken
            }
        }
    }
}