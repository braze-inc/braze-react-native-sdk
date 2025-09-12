package com.braze.reactbridge

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.annotation.VisibleForTesting
import com.braze.Braze
import com.braze.BrazeUser
import com.braze.Constants
import com.braze.enums.BrazePushEventType
import com.braze.events.BrazePushEvent
import com.braze.events.BrazeSdkAuthenticationErrorEvent
import com.braze.enums.CardCategory
import com.braze.enums.Gender
import com.braze.enums.Month.Companion.getMonth
import com.braze.enums.NotificationSubscriptionType
import com.braze.events.ContentCardsUpdatedEvent
import com.braze.events.FeatureFlagsUpdatedEvent
import com.braze.events.FeedUpdatedEvent
import com.braze.events.IEventSubscriber
import com.braze.models.cards.Card
import com.braze.models.inappmessage.IInAppMessage
import com.braze.models.inappmessage.InAppMessageImmersiveBase
import com.braze.models.outgoing.AttributionData
import com.braze.models.outgoing.BrazeProperties
import com.braze.support.BrazeLogger.Priority.V
import com.braze.support.BrazeLogger.Priority.W
import com.braze.support.BrazeLogger.brazelog
import com.braze.support.requestPushPermissionPrompt
import com.braze.ui.activities.BrazeFeedActivity
import com.braze.ui.activities.ContentCardsActivity
import com.braze.ui.inappmessage.BrazeInAppMessageManager
import com.braze.ui.inappmessage.InAppMessageOperation
import com.braze.ui.inappmessage.listeners.DefaultInAppMessageManagerListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import org.json.JSONArray
import org.json.JSONObject
import java.math.BigDecimal
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock
import com.braze.ui.BrazeDeeplinkHandler
import com.braze.enums.inappmessage.ClickAction
import com.braze.ui.actions.NewsfeedAction
import com.braze.support.toBundle
import com.braze.enums.Channel
import com.braze.events.BannersUpdatedEvent
import com.braze.models.push.BrazeNotificationPayload
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableNativeArray

@Suppress("TooManyFunctions", "LargeClass")
class BrazeReactBridgeImpl(
    val reactApplicationContext: ReactApplicationContext,
    val currentActivity: Activity?
) {
    private val callbackCallLock = Any()
    private val contentCards = mutableListOf<Card>()
    private val newsFeedCards = mutableListOf<Card>()
    private val newsFeedSubscriberMap: MutableMap<Callback, IEventSubscriber<FeedUpdatedEvent>?> = ConcurrentHashMap()
    private val callbackCallMap = ConcurrentHashMap<Callback, Boolean?>()
    private val contentCardsLock = ReentrantLock()
    private var contentCardsUpdatedAt: Long = 0
    private var newsFeedCardsUpdatedAt: Long = 0
    private var inAppMessageDisplayOperation: InAppMessageOperation = InAppMessageOperation.DISPLAY_NOW
    private lateinit var contentCardsUpdatedSubscriber: IEventSubscriber<ContentCardsUpdatedEvent>
    private lateinit var bannersUpdatedSubscriber: IEventSubscriber<BannersUpdatedEvent>
    private lateinit var newsFeedCardsUpdatedSubscriber: IEventSubscriber<FeedUpdatedEvent>
    private lateinit var sdkAuthErrorSubscriber: IEventSubscriber<BrazeSdkAuthenticationErrorEvent>
    private lateinit var pushNotificationEventSubscriber: IEventSubscriber<BrazePushEvent>
    private lateinit var featureFlagsUpdatedSubscriber: IEventSubscriber<FeatureFlagsUpdatedEvent>

    init {
        subscribeToContentCardsUpdatedEvent()
        subscribeToBannersUpdatedEvent()
        subscribeToNewsFeedCardsUpdatedEvent()
        subscribeToSdkAuthenticationErrorEvents()
        subscribeToFeatureFlagsUpdatedEvent()
    }

    @VisibleForTesting
    internal var brazeTestingMock: Braze? = null
    val braze: Braze
        get() = brazeTestingMock ?: Braze.getInstance(reactApplicationContext)

    fun requestImmediateDataFlush() = braze.requestImmediateDataFlush()

    fun changeUser(userName: String, sdkAuthToken: String?) = braze.changeUser(userName, sdkAuthToken)

    fun getUserId(callback: Callback) {
        runOnUser {
            if (it.userId.isBlank()) {
                callback.reportResult(null, "User ID not found.")
            } else {
                callback.reportResult(it.userId)
            }
        }
    }

    fun addAlias(aliasName: String, aliasLabel: String) {
        if (aliasName.isBlank()) {
            brazelog(W) {
                "Invalid alias parameter: alias is required to be non-empty. " +
                    "Not adding alias."
            }
            return
        }
        if (aliasLabel.isBlank()) {
            brazelog(W) {
                "Invalid label parameter: label is required to be non-empty. " +
                    "Not adding alias."
            }
            return
        }
        runOnUser {
            it.addAlias(aliasName, aliasLabel)
        }
    }

    fun registerPushToken(token: String) {
        braze.registeredPushToken = token
    }

    fun logCustomEvent(eventName: String, eventProperties: ReadableMap?) =
        braze.logCustomEvent(eventName, populateEventPropertiesFromReadableMap(eventProperties))

    fun logPurchase(
        productIdentifier: String,
        price: String,
        currencyCode: String,
        quantity: Int,
        eventProperties: ReadableMap?
    ) =
        braze.logPurchase(
            productIdentifier,
            currencyCode,
            BigDecimal(price),
            quantity,
            populateEventPropertiesFromReadableMap(eventProperties)
        )

    fun setStringCustomUserAttribute(key: String, value: String, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    fun setBoolCustomUserAttribute(key: String, value: Boolean, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    fun setIntCustomUserAttribute(key: String, value: Int, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    fun setDoubleCustomUserAttribute(key: String, value: Float, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    fun setDateCustomUserAttribute(key: String, timeStamp: Int, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.setCustomUserAttributeToSecondsFromEpoch(key, timeStamp.toLong()))
        }
    }

    fun incrementCustomUserAttribute(key: String, incrementValue: Int, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.incrementCustomUserAttribute(key, incrementValue))
        }
    }

    fun unsetCustomUserAttribute(key: String, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.unsetCustomUserAttribute(key))
        }
    }

    fun setCustomUserAttributeObjectArray(key: String, value: ReadableArray, callback: Callback?) {
        val attributeArray = JSONArray(parseReadableArray(value))
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, attributeArray))
        }
    }

    fun setCustomUserAttributeArray(key: String, value: ReadableArray, callback: Callback?) {
        val size = value.size()
        val attributeArray = arrayOfNulls<String>(size)
        for (i in 0 until size) {
            attributeArray[i] = value.getString(i)
        }
        runOnUser {
            callback.reportResult(it.setCustomAttributeArray(key, attributeArray))
        }
    }

    fun setCustomUserAttributeObject(key: String?, value: ReadableMap?, merge: Boolean, callback: Callback?) {
        if (key == null) {
            brazelog { "Key was null. Not logging setCustomUserAttributeObject." }
            return
        }
        if (value == null) {
            brazelog { "Value was null. Not logging setCustomUserAttributeObject." }
            return
        }
        val json = JSONObject(parseReadableMap(value))
        runOnUser {
            callback.reportResult(it.setCustomAttribute(key, json, merge))
        }
    }

    fun addToCustomAttributeArray(key: String, value: String, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.addToCustomAttributeArray(key, value))
        }
    }

    fun removeFromCustomAttributeArray(key: String, value: String, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.removeFromCustomAttributeArray(key, value))
        }
    }

    fun setFirstName(firstName: String?) = runOnUser { it.setFirstName(firstName) }

    fun setLastName(lastName: String?) = runOnUser { it.setLastName(lastName) }

    fun setEmail(email: String?) = runOnUser { it.setEmail(email) }

    fun setGender(gender: String?, callback: Callback?) {
        val genderValue = Gender.getGender(gender?.lowercase(Locale.US))
        runOnUser { callback.reportResult(it.setGender(genderValue)) }
    }

    fun setDateOfBirth(year: Int, month: Int, day: Int) =
        runOnUser {
            // Month is 0-indexed in the Android SDK, so we need to subtract 1 from the month value
            val monthEnum = getMonth(month - 1)
            if (monthEnum != null) {
                it.setDateOfBirth(year, monthEnum, day)
            } else {
                brazelog(W) {
                    "Invalid date of birth parameter: month is required to be within specified range. " +
                        "Not setting date of birth."
                }
            }
        }

    fun setCountry(country: String?) = runOnUser { it.setCountry(country) }

    fun setHomeCity(homeCity: String?) = runOnUser { it.setHomeCity(homeCity) }

    fun setPhoneNumber(phoneNumber: String?) = runOnUser { it.setPhoneNumber(phoneNumber) }

    fun setLanguage(language: String?) = runOnUser { it.setLanguage(language) }

    fun addToSubscriptionGroup(groupId: String, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.addToSubscriptionGroup(groupId))
        }
    }

    fun removeFromSubscriptionGroup(groupId: String, callback: Callback?) {
        runOnUser {
            callback.reportResult(it.removeFromSubscriptionGroup(groupId))
        }
    }

    fun setPushNotificationSubscriptionType(subscriptionType: String, callback: Callback?) {
        val subscriptionValue = subscriptionType.parseNotificationSubscriptionType()
        if (subscriptionValue == null) {
            callback.reportResult(
                error = "Invalid subscription type $subscriptionType." +
                    " Push notification subscription type not set."
            )
            return
        }
        runOnUser {
            callback.reportResult(it.setPushNotificationSubscriptionType(subscriptionValue))
        }
    }

    fun setEmailNotificationSubscriptionType(subscriptionType: String, callback: Callback?) {
        val subscriptionValue = subscriptionType.parseNotificationSubscriptionType()
        if (subscriptionValue == null) {
            callback.reportResult(
                error = "Invalid subscription type $subscriptionType." +
                    " Email notification subscription type not set."
            )
            return
        }
        runOnUser {
            callback.reportResult(it.setEmailNotificationSubscriptionType(subscriptionValue))
        }
    }

    fun launchNewsFeed() {
        val intent = Intent(currentActivity, BrazeFeedActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        this.reactApplicationContext.startActivity(intent)
    }

    fun requestFeedRefresh() {
        braze.requestFeedRefresh()
    }

    fun getBanner(placementId: String, promise: Promise) {
        braze.getBanner(placementId)?.let {
            promise.resolve(mapBanner(it))
        } ?: promise.resolve(null)
    }

    fun requestBannersRefresh(placementIds: ReadableArray) {
        val convertedPlacementIds = placementIds.toArrayList().map { it.toString() }
        braze.requestBannersRefresh(convertedPlacementIds)
    }

    fun getNewsFeedCards(promise: Promise) {
        braze.subscribeToFeedUpdates(IEventSubscriber {
            promise.resolve(mapContentCards(it.feedCards))
            updateNewsFeedCardsIfNeeded(it)
        })
        braze.requestFeedRefresh()
    }

    fun logNewsFeedCardClicked(id: String) {
        getNewsFeedCardById(id)?.logClick()
    }

    fun logNewsFeedCardImpression(id: String) {
        getNewsFeedCardById(id)?.logImpression()
    }

    fun launchContentCards(@Suppress("UNUSED_PARAMETER") dismissAutomaticallyOnCardClick: Boolean) {
        val intent = Intent(currentActivity, ContentCardsActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        this.reactApplicationContext.startActivity(intent)
    }

    fun requestContentCardsRefresh() {
        braze.requestContentCardsRefresh()
    }

    fun getContentCards(promise: Promise) {
        braze.subscribeToContentCardsUpdates(IEventSubscriber { message ->
            promise.resolve(mapContentCards(message.allCards))
            updateContentCardsIfNeeded(message)
        })
        braze.requestContentCardsRefresh()
    }

    fun getCachedContentCards(promise: Promise) {
        contentCardsLock.withLock {
            promise.resolve(mapContentCards(contentCards))
        }
    }

    fun setSdkAuthenticationSignature(token: String) {
        braze.setSdkAuthenticationSignature(token)
    }

    @Suppress("UnusedPrivateMember")
    fun requestPushPermission(@Suppress("UNUSED_PARAMETER") options: ReadableMap?) =
        currentActivity.requestPushPermissionPrompt()

    private fun subscribeToContentCardsUpdatedEvent() {
        if (this::contentCardsUpdatedSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                contentCardsUpdatedSubscriber,
                ContentCardsUpdatedEvent::class.java
            )
        }
        contentCardsUpdatedSubscriber = IEventSubscriber { event ->
            val eventData = Arguments.createMap()
            eventData.putArray("cards", mapContentCards(event.allCards))
            if (reactApplicationContext.hasActiveReactInstance()) {
                reactApplicationContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(CONTENT_CARDS_UPDATED_EVENT_NAME, eventData)
            }
            updateContentCardsIfNeeded(event)
        }

        braze.subscribeToContentCardsUpdates(contentCardsUpdatedSubscriber)
    }

    private fun subscribeToBannersUpdatedEvent() {
        if (this::bannersUpdatedSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                bannersUpdatedSubscriber,
                BannersUpdatedEvent::class.java
            )
        }
        bannersUpdatedSubscriber = IEventSubscriber { event ->
            val eventData = Arguments.createMap()
            eventData.putArray("banners", mapBanners(event.banners))
            if (reactApplicationContext.hasActiveReactInstance()) {
                reactApplicationContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(BANNER_CARDS_UPDATED_EVENT_NAME, eventData)
            }
        }

        braze.subscribeToBannersUpdates(bannersUpdatedSubscriber)
    }

    private fun subscribeToNewsFeedCardsUpdatedEvent() {
        if (this::newsFeedCardsUpdatedSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                newsFeedCardsUpdatedSubscriber,
                FeedUpdatedEvent::class.java
            )
        }
        newsFeedCardsUpdatedSubscriber = IEventSubscriber { event ->
            val updated = event.lastUpdatedInSecondsFromEpoch() > contentCardsUpdatedAt
            if (updated && reactApplicationContext.hasActiveReactInstance()) {
                reactApplicationContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(NEWS_FEED_CARDS_UPDATED_EVENT_NAME, updated)
            }
            updateNewsFeedCardsIfNeeded(event)
        }

        braze.subscribeToFeedUpdates(newsFeedCardsUpdatedSubscriber)
    }

    private fun subscribeToFeatureFlagsUpdatedEvent() {
        if (this::featureFlagsUpdatedSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                featureFlagsUpdatedSubscriber,
                FeatureFlagsUpdatedEvent::class.java
            )
        }
        featureFlagsUpdatedSubscriber = IEventSubscriber { event ->
            val data = Arguments.createArray()
            event.featureFlags.forEach {
                data.pushMap(convertFeatureFlag(it))
            }

            if (reactApplicationContext.hasActiveReactInstance()) {
                reactApplicationContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(FEATURE_FLAGS_UPDATED_EVENT_NAME, data)
            }
        }

        braze.subscribeToFeatureFlagsUpdates(featureFlagsUpdatedSubscriber)
    }

    private fun subscribeToSdkAuthenticationErrorEvents() {
        if (this::sdkAuthErrorSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                sdkAuthErrorSubscriber,
                BrazeSdkAuthenticationErrorEvent::class.java
            )
        }
        sdkAuthErrorSubscriber = IEventSubscriber { errorEvent ->
            if (!reactApplicationContext.hasActiveReactInstance()) {
                return@IEventSubscriber
            }
            val data = WritableNativeMap()
            data.putInt("error_code", errorEvent.errorCode)
            data.putString("user_id", errorEvent.userId)
            data.putString("original_signature", errorEvent.signature)
            data.putString("error_reason", errorEvent.errorReason)
            reactApplicationContext
                .getJSModule(RCTDeviceEventEmitter::class.java)
                .emit(SDK_AUTH_ERROR_EVENT_NAME, data)
        }
        braze.subscribeToSdkAuthenticationFailures(sdkAuthErrorSubscriber)
    }

    private fun subscribeToPushNotificationEvents() {
        brazelog(V) { "subscribeToPushNotificationEvents called" }
        if (!reactApplicationContext.hasActiveReactInstance()) {
            brazelog { "Cannot call subscribeToPushNotificationEvents without an active react instance" }
            return
        }
        if (this::pushNotificationEventSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                pushNotificationEventSubscriber,
                BrazePushEvent::class.java
            )
        }

        pushNotificationEventSubscriber = IEventSubscriber { event ->
            val pushType = getPushEventType(event.eventType) ?: return@IEventSubscriber
            val eventData = event.notificationPayload
            val data = createPushNotificationData(eventData, pushType)
            addBrazePropertiesToData(data, eventData)

            brazelog { "Sending push notification event with data $data" }
            reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java)
                .emit(PUSH_NOTIFICATION_EVENT_NAME, data)
        }
        braze.subscribeToPushNotificationEvents(pushNotificationEventSubscriber)
    }

    @VisibleForTesting
    internal fun getPushEventType(eventType: BrazePushEventType): String? {
        return when (eventType) {
            BrazePushEventType.NOTIFICATION_RECEIVED -> "push_received"
            BrazePushEventType.NOTIFICATION_OPENED -> "push_opened"
            else -> null
        }
    }

    private fun createPushNotificationData(
        eventData: BrazeNotificationPayload,
        pushType: String
    ): WritableNativeMap {
        return WritableNativeMap().apply {
            putString("payload_type", pushType)
            putString("url", eventData.deeplink)
            putString("title", eventData.titleText)
            putString("body", eventData.contentText)
            putString("summary_text", eventData.summaryText)
            eventData.notificationBadgeNumber?.let { putInt("badge_count", it) }
            eventData.notificationExtras.getLong(Constants.BRAZE_PUSH_RECEIVED_TIMESTAMP_MILLIS)
                .takeUnless { it == 0L }?.let {
                    // Convert to Double when passing to JS layer since timestamp can't fit in a 32-bit
                    // int and WriteableNativeMap doesn't support longs bc of language limitations
                    putDouble("timestamp", it.toDouble())
                }
            putBoolean(
                "use_webview",
                eventData.notificationExtras.getString(Constants.BRAZE_PUSH_OPEN_URI_IN_WEBVIEW_KEY) == "true"
            )
            putBoolean(
                "is_silent", eventData.titleText == null && eventData.contentText == null
            )
            putBoolean(
                "is_braze_internal",
                eventData.isUninstallTrackingPush || eventData.shouldRefreshFeatureFlags
            )
            putString("image_url", eventData.bigImageUrl)
            putMap("android", convertToMap(eventData.notificationExtras))

            // Deprecated legacy fields
            putString("push_event_type", pushType)
            putString("deeplink", eventData.deeplink)
            putString("content_text", eventData.contentText)
            putString("raw_android_push_data", eventData.notificationExtras.toString())
        }
    }

    private fun addBrazePropertiesToData(
        data: WritableNativeMap,
        eventData: BrazeNotificationPayload
    ) {
        // WritableNativeMap can only be consumed once and will be erased from memory after reading from it.
        // Need to create two distinct maps to avoid errors after consuming the first one.
        val returnedKvpMap = convertToMap(
            eventData.brazeExtras,
            setOf(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY)
        )
        val brazePropertiesMap = convertToMap(
            eventData.brazeExtras,
            setOf(Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY)
        )
        data.putMap("braze_properties", brazePropertiesMap)
        // Deprecated legacy field
        data.putMap("kvp_data", returnedKvpMap)
    }

    fun logContentCardDismissed(id: String) {
        getContentCardById(id)?.isDismissed = true
    }

    fun logContentCardClicked(id: String) {
        getContentCardById(id)?.logClick()
    }

    fun logContentCardImpression(id: String) {
        getContentCardById(id)?.logImpression()
    }

    fun processContentCardClickAction(id: String) {
        brazelog(V) { "Processing content card action $id" }
        val card = getContentCardById(id) ?: return
        val extras = Bundle()
        for (key in card.extras.keys) {
            extras.putString(key, card.extras[key])
        }
        val url = card.url
        if (url == null) {
            brazelog(V) { "Card URL is null, returning null for getUriActionForCard" }
            return
        }
        val action = BrazeDeeplinkHandler.getInstance().createUriActionFromUrlString(
            url,
            extras,
            card.openUriInWebView,
            card.channel
        )
        if (action != null) {
            BrazeDeeplinkHandler.getInstance().gotoUri(reactApplicationContext, action)
        }
    }

    /**
     * Registers a short-lived FeedUpdatedEvent subscriber, requests
     * a feed refresh from cache, and and returns the
     * requested card count in the callback
     */
    private fun getCardCountForTag(category: String?, callback: Callback?, cardCountTag: String) {
        if (callback == null) {
            return
        }

        val cardCategory = getCardCategoryFromString(category)
        // Note that Android does not have a CardCategory.ALL enum, while iOS does
        if (category == null || cardCategory == null && category != "all") {
            callback.reportResult(
                error = "Invalid card category $category," +
                    " could not retrieve$cardCountTag"
            )
            return
        }

        // Register FeedUpdatedEvent subscriber
        var newsFeedUpdatedSubscriber: IEventSubscriber<FeedUpdatedEvent>? = null
        var requestingNewsFeedUpdateFromCache = false

        // Callback blocks (error or result) may only be invoked once, else React Native throws an error.
        when (cardCountTag) {
            CARD_COUNT_TAG -> {
                // getCardCount
                newsFeedUpdatedSubscriber = IEventSubscriber { newsFeedUpdatedEvent ->
                    synchronized(callbackCallLock) {
                        if (callbackCallMap[callback] == null) {
                            callbackCallMap[callback] = true
                            if (category == "all") {
                                callback.reportResult(newsFeedUpdatedEvent.cardCount)
                            } else {
                                callback.reportResult(newsFeedUpdatedEvent.getCardCount(cardCategory))
                            }
                        }
                    }
                    // Remove this listener from the feed subscriber map and from Braze
                    braze.removeSingleSubscription(newsFeedSubscriberMap[callback], FeedUpdatedEvent::class.java)
                    newsFeedSubscriberMap.remove(callback)
                }
                requestingNewsFeedUpdateFromCache = true
            }

            UNREAD_CARD_COUNT_TAG -> {
                // getUnreadCardCount
                newsFeedUpdatedSubscriber = IEventSubscriber { newsFeedUpdatedEvent ->
                    synchronized(callbackCallLock) {
                        if (callbackCallMap[callback] == null) {
                            callbackCallMap[callback] = true
                            if (category == "all") {
                                callback.reportResult(newsFeedUpdatedEvent.unreadCardCount)
                            } else {
                                callback.reportResult(newsFeedUpdatedEvent.getUnreadCardCount(cardCategory))
                            }
                        }
                    }
                    // Remove this listener from the feed subscriber map and from Braze
                    braze.removeSingleSubscription(newsFeedSubscriberMap[callback], FeedUpdatedEvent::class.java)
                    newsFeedSubscriberMap.remove(callback)
                }
                requestingNewsFeedUpdateFromCache = true
            }
        }
        if (requestingNewsFeedUpdateFromCache && newsFeedUpdatedSubscriber != null) {
            // Put the subscriber into a map so we can remove it later from future subscriptions
            newsFeedSubscriberMap[callback] = newsFeedUpdatedSubscriber
            braze.subscribeToFeedUpdates(newsFeedUpdatedSubscriber)
            braze.requestFeedRefreshFromCache()
        }
    }

    fun getCardCountForCategories(category: String, callback: Callback?) =
        getCardCountForTag(category, callback, CARD_COUNT_TAG)

    fun getUnreadCardCountForCategories(category: String, callback: Callback?) =
        getCardCountForTag(category, callback, UNREAD_CARD_COUNT_TAG)

    fun wipeData() = Braze.wipeData(reactApplicationContext)

    fun disableSDK() = Braze.disableSdk(reactApplicationContext)

    fun enableSDK() = Braze.enableSdk(reactApplicationContext)

    fun requestLocationInitialization() = braze.requestLocationInitialization()

    fun requestGeofences(latitude: Double, longitude: Double) = braze.requestGeofences(latitude, longitude)

    fun setLocationCustomAttribute(key: String, latitude: Double, longitude: Double, callback: Callback?) {
        runOnUser {
            it.setLocationCustomAttribute(key, latitude, longitude)
            // Always return true as Android doesn't support
            // getting a result from setLocationCustomAttribute().
            callback.reportResult(true)
        }
    }

    fun setLastKnownLocation(
        latitude: Double,
        longitude: Double,
        altitude: Double,
        horizontalAccuracy: Double,
        verticalAccuracy: Double
    ) {
        runOnUser {
            val sanitizedHorizontalAccuracy = horizontalAccuracy.takeUnless { accuracy -> accuracy < 0 }
            val sanitizedVerticalAccuracy = verticalAccuracy.takeUnless { accuracy -> accuracy < 0 }
            val sanitizedAltitude = altitude.takeUnless { sanitizedVerticalAccuracy == null }
            it.setLastKnownLocation(
                latitude,
                longitude,
                sanitizedAltitude,
                sanitizedHorizontalAccuracy,
                sanitizedVerticalAccuracy
            )
        }
    }

    fun subscribeToInAppMessage(useBrazeUI: Boolean) {
        inAppMessageDisplayOperation = if (useBrazeUI) {
            InAppMessageOperation.DISPLAY_NOW
        } else {
            InAppMessageOperation.DISPLAY_LATER
        }
        setDefaultInAppMessageListener()
    }

    fun hideCurrentInAppMessage() =
        BrazeInAppMessageManager.getInstance().hideCurrentlyDisplayingInAppMessage(true)

    fun logInAppMessageClicked(inAppMessageString: String) {
        braze.deserializeInAppMessageString(inAppMessageString)?.logClick()
    }

    fun logInAppMessageImpression(inAppMessageString: String) =
        braze.deserializeInAppMessageString(inAppMessageString)?.logImpression()

    fun logInAppMessageButtonClicked(inAppMessageString: String, buttonId: Int) {
        val inAppMessage = braze.deserializeInAppMessageString(inAppMessageString)
        if (inAppMessage is InAppMessageImmersiveBase) {
            inAppMessage.messageButtons
                .firstOrNull { it.id == buttonId }
                ?.let { inAppMessage.logButtonClick(it) }
        }
    }

    fun performInAppMessageAction(inAppMessageString: String, buttonId: Int) {
        brazelog(V) { "Processing in-app message action $inAppMessageString" }
        val inAppMessage = braze.deserializeInAppMessageString(inAppMessageString)
        val activity = currentActivity
        var actionData: InAppMessageActionData? = null
        if (inAppMessage != null && activity != null) {
            actionData = getInAppMessageActionData(inAppMessage, buttonId)
        }
        if (inAppMessage == null || activity == null || actionData == null) {
            if (activity == null) {
                brazelog(W) { "Can't perform click action because the cached activity is null." }
            }
            return
        }
        executeInAppMessageAction(actionData, inAppMessage, activity)
    }

    private fun getInAppMessageActionData(
        inAppMessage: IInAppMessage,
        buttonId: Int
    ): InAppMessageActionData? {
        var result: InAppMessageActionData? = null
        if (buttonId < 0) {
            result = InAppMessageActionData(
                clickAction = inAppMessage.clickAction,
                clickUri = inAppMessage.uri,
                openUriInWebView = inAppMessage.openUriInWebView
            )
        } else if (inAppMessage is InAppMessageImmersiveBase) {
            val button = inAppMessage.messageButtons.firstOrNull { it.id == buttonId }
            result = InAppMessageActionData(
                clickAction = button?.clickAction,
                clickUri = button?.uri,
                openUriInWebView = button?.openUriInWebview ?: false
            )
        } else {
            brazelog {
                "Cannot perform IAM action because " +
                    "button was not null but message " +
                    "is not InAppMessageImmersiveBase"
            }
        }
        return result
    }

    private fun executeInAppMessageAction(
        actionData: InAppMessageActionData,
        inAppMessage: IInAppMessage,
        activity: Activity
    ) {
        brazelog {
            "GOT ACTION: ${actionData.clickUri}, ${actionData.openUriInWebView}, ${actionData.clickAction}"
        }

        when (actionData.clickAction) {
            ClickAction.NEWS_FEED -> {
                val newsfeedAction = NewsfeedAction(
                    inAppMessage.extras.toBundle(),
                    Channel.INAPP_MESSAGE
                )
                BrazeDeeplinkHandler.getInstance()
                    .gotoNewsFeed(activity, newsfeedAction)
            }

            ClickAction.URI -> {
                executeUriAction(actionData, inAppMessage)
            }

            else -> {
                brazelog { "Unhandled action ${actionData.clickAction}" }
            }
        }
    }

    private fun executeUriAction(actionData: InAppMessageActionData, inAppMessage: IInAppMessage) {
        val clickUri = actionData.clickUri ?: run {
            brazelog { "clickUri is null, not performing click action" }
            return
        }

        val uriAction = BrazeDeeplinkHandler.getInstance().createUriActionFromUri(
            clickUri,
            inAppMessage.extras.toBundle(),
            actionData.openUriInWebView,
            Channel.INAPP_MESSAGE
        )

        if (!reactApplicationContext.hasActiveReactInstance()) {
            brazelog { "reactApplicationContext instance not active, not performing click action" }
            return
        }

        brazelog(W) {
            "Performing gotoUri $clickUri ${actionData.openUriInWebView}"
        }
        BrazeDeeplinkHandler.getInstance().gotoUri(
            reactApplicationContext,
            uriAction
        )
    }

    private data class InAppMessageActionData(
        val clickAction: ClickAction?,
        val clickUri: Uri?,
        val openUriInWebView: Boolean
    )

    fun setAttributionData(network: String?, campaign: String?, adGroup: String?, creative: String?) {
        @Suppress("ComplexCondition")
        if (network == null ||
            campaign == null ||
            adGroup == null ||
            creative == null
        ) {
            brazelog { "Attribution data arguments were null. Not logging." }
            return
        }
        val attributionData = AttributionData(network, campaign, adGroup, creative)
        runOnUser {
            it.setAttributionData(attributionData)
        }
    }

    fun getDeviceId(callback: Callback) = braze.getDeviceIdAsync { callback.reportResult(it) }

    private fun runOnUser(block: (user: BrazeUser) -> Unit) {
        braze.getCurrentUser {
            block(it)
        }
    }

    fun addListener(eventName: String) {
        when (eventName) {
            PUSH_NOTIFICATION_EVENT_NAME -> {
                brazelog { "Adding push notification event listener $eventName" }
                subscribeToPushNotificationEvents()
            }

            IN_APP_MESSAGE_RECEIVED_EVENT_NAME -> {
                val listener = BrazeInAppMessageManager.getInstance().inAppMessageManagerListener
                if (listener is DefaultInAppMessageManagerListener) {
                    brazelog { "Adding in-app message event listener $eventName" }
                    setDefaultInAppMessageListener()
                }
            }
        }
    }

    fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) {
        // Dummy method required to suppress NativeEventEmitter warnings.
    }

    /**
     * Updates the last known Content Card refresh data
     */
    private fun updateContentCardsIfNeeded(event: ContentCardsUpdatedEvent) {
        if (event.timestampSeconds > contentCardsUpdatedAt) {
            contentCardsLock.withLock {
                contentCardsUpdatedAt = event.timestampSeconds
                contentCards.clear()
                contentCards.addAll(event.allCards)
            }
        }
    }

    /**
     * Updates the last known Feed Card refresh data
     */
    private fun updateNewsFeedCardsIfNeeded(event: FeedUpdatedEvent) {
        if (event.lastUpdatedInSecondsFromEpoch() > newsFeedCardsUpdatedAt) {
            newsFeedCardsUpdatedAt = event.lastUpdatedInSecondsFromEpoch()
            newsFeedCards.clear()
            newsFeedCards.addAll(event.feedCards)
        }
    }

    private fun getNewsFeedCardById(id: String): Card? =
        newsFeedCards.firstOrNull { it.id == id }

    private fun getContentCardById(id: String): Card? =
        contentCardsLock.withLock {
            contentCards.firstOrNull { it.id == id }
        }

    fun getAllFeatureFlags(promise: Promise) {
        val ffs = braze.getAllFeatureFlags()
        val data = Arguments.createArray()
        ffs.forEach {
            data.pushMap(convertFeatureFlag(it))
        }
        promise.resolve(data)
    }

    fun getFeatureFlag(id: String, promise: Promise) {
        val ff = braze.getFeatureFlag(id)
        if (ff == null) {
            promise.resolve(null)
        } else {
            promise.resolve(convertFeatureFlag(ff))
        }
    }

    fun refreshFeatureFlags() {
        braze.refreshFeatureFlags()
    }

    fun logFeatureFlagImpression(id: String) {
        braze.logFeatureFlagImpression(id)
    }

    fun getFeatureFlagBooleanProperty(id: String, key: String, promise: Promise) {
        promise.resolve(braze.getFeatureFlag(id)?.getBooleanProperty(key))
    }

    fun getFeatureFlagStringProperty(id: String, key: String, promise: Promise) {
        promise.resolve(braze.getFeatureFlag(id)?.getStringProperty(key))
    }

    fun getFeatureFlagNumberProperty(id: String, key: String, promise: Promise) {
        promise.resolve(braze.getFeatureFlag(id)?.getNumberProperty(key))
    }

    fun getFeatureFlagTimestampProperty(id: String, key: String, promise: Promise) {
        // Convert timestamp to double because the React Native translation layer doesn't support `long`
        val convertedTimestamp = braze.getFeatureFlag(id)?.getTimestampProperty(key)?.toDouble()
        promise.resolve(convertedTimestamp)
    }

    fun getFeatureFlagJSONProperty(id: String, key: String, promise: Promise) {
        val jsonMap = braze.getFeatureFlag(id)?.getJSONProperty(key)?.let { jsonToNativeMap(it) }
        promise.resolve(jsonMap)
    }

    fun getFeatureFlagImageProperty(id: String, key: String, promise: Promise) {
        promise.resolve(braze.getFeatureFlag(id)?.getImageProperty(key))
    }

    fun setAdTrackingEnabled(adTrackingEnabled: Boolean, googleAdvertisingId: String) {
        braze.setGoogleAdvertisingId(googleAdvertisingId, adTrackingEnabled)
    }

    private fun setDefaultInAppMessageListener() {
        BrazeInAppMessageManager.getInstance()
            .setCustomInAppMessageManagerListener(
                object : DefaultInAppMessageManagerListener() {
                    override fun beforeInAppMessageDisplayed(inAppMessage: IInAppMessage): InAppMessageOperation {
                        val parameters: WritableMap = WritableNativeMap()
                        parameters.putString("inAppMessage", inAppMessage.forJsonPut().toString())
                        reactApplicationContext
                            .getJSModule(RCTDeviceEventEmitter::class.java)
                            .emit(IN_APP_MESSAGE_RECEIVED_EVENT_NAME, parameters)
                        return inAppMessageDisplayOperation
                    }
                }
            )
    }

    private fun convertToMap(bundle: Bundle, filteringKeys: Set<String> = emptySet()): ReadableMap {
        val nativeMap = WritableNativeMap()
        bundle.keySet()
            .filter { !filteringKeys.contains(it) }
            .associateWith { @Suppress("deprecation") bundle[it] }
            .forEach { nativeMap.putString(it.key, it.value.toString()) }
        return nativeMap
    }

    companion object {
        const val NAME = "BrazeReactBridge"
        private const val CARD_COUNT_TAG = "card count"
        private const val UNREAD_CARD_COUNT_TAG = "unread card count"
        private const val CONTENT_CARDS_UPDATED_EVENT_NAME = "contentCardsUpdated"
        private const val BANNER_CARDS_UPDATED_EVENT_NAME = "bannerCardsUpdated"
        private const val FEATURE_FLAGS_UPDATED_EVENT_NAME = "featureFlagsUpdated"
        private const val NEWS_FEED_CARDS_UPDATED_EVENT_NAME = "newsFeedCardsUpdated"
        private const val SDK_AUTH_ERROR_EVENT_NAME = "sdkAuthenticationError"
        private const val IN_APP_MESSAGE_RECEIVED_EVENT_NAME = "inAppMessageReceived"
        private const val PUSH_NOTIFICATION_EVENT_NAME = "pushNotificationEvent"

        /**
         * Note that for non-primitive or non-String arguments, Callbacks must be invoked with `Writable`
         * components from the [com.facebook.react.bridge] package (e.g., [WritableArray] or [WritableMap]).
         * Attempting to pass other types will result in a "Cannot convert argument of type class X" error.
         * For reference: https://github.com/facebook/react-native/issues/3101#issuecomment-143954448
         */
        private fun Callback?.reportResult(result: Any? = null, error: String? = null) {
            if (this != null) {
                if (error != null) {
                    this.invoke(error)
                } else {
                    this.invoke(null, result)
                }
            } else {
                brazelog(W) { "Warning: BrazeReactBridge callback was null." }
            }
        }

        /**
         * Parses a `JSONObject` to a React Native map object.
         * The cases for each type follows all supported types of the `ReadableMap` class.
         */
        private fun jsonToNativeMap(jsonObject: JSONObject): ReadableMap {
            val nativeMap = WritableNativeMap()
            jsonObject.keys().forEach { key ->
                when (val value = jsonObject.get(key)) {
                    is JSONObject -> nativeMap.putMap(key, jsonToNativeMap(value))
                    is JSONArray -> nativeMap.putArray(key, jsonToNativeArray(value))
                    is Boolean -> nativeMap.putBoolean(key, value)
                    is Int -> nativeMap.putInt(key, value)
                    is Double -> nativeMap.putDouble(key, value)
                    is String -> nativeMap.putString(key, value)
                    JSONObject.NULL -> nativeMap.putNull(key)
                }
            }
            return nativeMap
        }

        /**
         * Parses a `JSONArray` to a React Native array object.
         * The cases for each type follows all supported types of the `ReadableArray` class.
         */
        private fun jsonToNativeArray(jsonArray: JSONArray): ReadableArray {
            val nativeArray = WritableNativeArray()
            for (i in 0 until jsonArray.length()) {
                when (val value = jsonArray.opt(i)) {
                    is JSONObject -> nativeArray.pushMap(jsonToNativeMap(value))
                    is JSONArray -> nativeArray.pushArray(jsonToNativeArray(value))
                    is Boolean -> nativeArray.pushBoolean(value)
                    is Int -> nativeArray.pushInt(value)
                    is Double -> nativeArray.pushDouble(value)
                    is String -> nativeArray.pushString(value)
                    JSONObject.NULL -> nativeArray.pushNull()
                    else -> nativeArray.pushString(value.toString())
                }
            }
            return nativeArray
        }

        private fun populateEventPropertiesFromReadableMap(eventProperties: ReadableMap?): BrazeProperties? {
            return when (eventProperties) {
                null -> null
                JSONObject.NULL -> {
                    BrazeProperties()
                }

                else -> {
                    BrazeProperties(JSONObject(parseReadableMap(eventProperties)))
                }
            }
        }

        private fun parseReadableMap(readableMap: ReadableMap): Map<*, *> {
            val keySetIterator = readableMap.keySetIterator()
            val parsedMap = readableMap.toHashMap()
            while (keySetIterator.hasNextKey()) {
                val key = keySetIterator.nextKey()

                when (readableMap.getType(key)) {
                    ReadableType.Map -> {
                        val mapValue = readableMap.getMap(key) ?: continue
                        if (mapValue.hasKey("type")
                            && mapValue.getType("type") == ReadableType.String
                            && mapValue.getString("type") == "UNIX_timestamp"
                        ) {
                            val unixTimestamp = mapValue.getDouble("value")
                            parsedMap[key] = Date(unixTimestamp.toLong())
                        } else {
                            parsedMap[key] = parseReadableMap(mapValue)
                        }
                    }

                    ReadableType.Array -> {
                        readableMap.getArray(key)?.let {
                            parsedMap[key] = parseReadableArray(it)
                        }
                    }

                    else -> {}
                }
            }
            return parsedMap
        }

        private fun parseReadableArray(readableArray: ReadableArray): List<*> {
            val parsedList = readableArray.toArrayList()
            for (i in 0 until readableArray.size()) {
                when (readableArray.getType(i)) {
                    ReadableType.Map -> {
                        val mapValue = readableArray.getMap(i) ?: continue
                        if (mapValue.hasKey("type")
                            && mapValue.getType("type") == ReadableType.String
                            && mapValue.getString("type") == "UNIX_timestamp"
                        ) {
                            val unixTimestamp = mapValue.getDouble("value")
                            parsedList[i] = Date(unixTimestamp.toLong())
                        } else {
                            parsedList[i] = parseReadableMap(mapValue)
                        }
                    }

                    ReadableType.Array -> {
                        readableArray.getArray(i)?.let {
                            parsedList[i] = parseReadableArray(it)
                        }
                    }

                    else -> {}
                }
            }
            return parsedList
        }

        private fun String?.parseNotificationSubscriptionType(): NotificationSubscriptionType? =
            when (this) {
                "subscribed" -> {
                    NotificationSubscriptionType.SUBSCRIBED
                }

                "unsubscribed" -> {
                    NotificationSubscriptionType.UNSUBSCRIBED
                }
                // Note that this is not a typo. There is no "_" in this enum for Braze React.
                "optedin" -> {
                    NotificationSubscriptionType.OPTED_IN
                }

                else -> null
            }

        private fun getCardCategoryFromString(categoryString: String?): CardCategory? {
            val categoryName = categoryString?.uppercase(Locale.getDefault()) ?: return null
            return CardCategory.values().firstOrNull { it.name == categoryName }
        }
    }
}
