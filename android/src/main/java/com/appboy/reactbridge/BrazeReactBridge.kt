package com.appboy.reactbridge

import android.content.Intent
import android.os.Bundle
import com.appboy.enums.CardCategory
import com.appboy.enums.Gender
import com.appboy.enums.Month.Companion.getMonth
import com.appboy.enums.NotificationSubscriptionType
import com.appboy.events.FeedUpdatedEvent
import com.appboy.models.cards.Card
import com.appboy.models.outgoing.AttributionData
import com.appboy.ui.activities.AppboyFeedActivity
import com.braze.Braze
import com.braze.BrazeUser
import com.braze.Constants
import com.braze.enums.BrazePushEventType
import com.braze.events.BrazePushEvent
import com.braze.events.BrazeSdkAuthenticationErrorEvent
import com.braze.events.ContentCardsUpdatedEvent
import com.braze.events.IEventSubscriber
import com.braze.models.inappmessage.IInAppMessage
import com.braze.models.inappmessage.IInAppMessageImmersive
import com.braze.models.outgoing.BrazeProperties
import com.braze.support.BrazeLogger.Priority.W
import com.braze.support.BrazeLogger.brazelog
import com.braze.support.requestPushPermissionPrompt
import com.braze.ui.activities.ContentCardsActivity
import com.braze.ui.inappmessage.BrazeInAppMessageManager
import com.braze.ui.inappmessage.InAppMessageOperation
import com.braze.ui.inappmessage.listeners.DefaultInAppMessageManagerListener
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import org.json.JSONObject
import java.math.BigDecimal
import java.util.*
import java.util.concurrent.ConcurrentHashMap

@Suppress("TooManyFunctions", "LargeClass")
class BrazeReactBridge(reactContext: ReactApplicationContext?) : ReactContextBaseJavaModule(reactContext) {
    private val callbackCallLock = Any()
    private val contentCards = mutableListOf<Card>()
    private val feedSubscriberMap: MutableMap<Callback, IEventSubscriber<FeedUpdatedEvent>?> = ConcurrentHashMap()
    private val callbackCallMap = ConcurrentHashMap<Callback, Boolean?>()
    private var contentCardsUpdatedAt: Long = 0
    private lateinit var contentCardsUpdatedSubscriber: IEventSubscriber<ContentCardsUpdatedEvent>
    private lateinit var sdkAuthErrorSubscriber: IEventSubscriber<BrazeSdkAuthenticationErrorEvent>
    private lateinit var pushNotificationEventSubscriber: IEventSubscriber<BrazePushEvent>

    init {
        subscribeToContentCardsUpdatedEvent()
        subscribeToSdkAuthenticationErrorEvents()
        subscribeToPushNotificationEvents()
    }

    private val braze: Braze
        get() = Braze.getInstance(reactApplicationContext)

    override fun getName() = "AppboyReactBridge"

    @ReactMethod
    fun requestImmediateDataFlush() = braze.requestImmediateDataFlush()

    @ReactMethod
    fun changeUser(userName: String?, sdkAuthToken: String?) = braze.changeUser(userName, sdkAuthToken)

    @ReactMethod
    fun addAlias(aliasName: String?, aliasLabel: String?) {
        if (aliasName.isNullOrBlank()) {
            brazelog(W) {
                "Invalid alias parameter: alias is required to be non-null and non-empty. " +
                    "Not adding alias."
            }
            return
        }
        if (aliasLabel.isNullOrBlank()) {
            brazelog(W) {
                "Invalid label parameter: label is required to be non-null and non-empty. " +
                    "Not adding alias."
            }
            return
        }
        runOnUser {
            it.addAlias(aliasName, aliasLabel)
        }
    }

    @ReactMethod
    fun registerAndroidPushToken(token: String?) {
        braze.registeredPushToken = token
    }

    @ReactMethod
    fun setGoogleAdvertisingId(googleAdvertisingId: String?, adTrackingEnabled: Boolean?) {
        if (googleAdvertisingId != null && adTrackingEnabled != null) {
            braze.setGoogleAdvertisingId(googleAdvertisingId, adTrackingEnabled)
        }
    }

    @ReactMethod
    fun logCustomEvent(eventName: String?, eventProperties: ReadableMap?) =
        braze.logCustomEvent(eventName, populateEventPropertiesFromReadableMap(eventProperties))

    @ReactMethod
    fun logPurchase(
        productIdentifier: String?,
        price: String?,
        currencyCode: String?,
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

    @ReactMethod
    fun setStringCustomUserAttribute(key: String?, value: String?, callback: Callback?) {
        if (key == null || value == null) {
            brazelog { "Key or value was null. Not logging custom user attribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    @ReactMethod
    fun setBoolCustomUserAttribute(key: String?, value: Boolean?, callback: Callback?) {
        if (key == null || value == null) {
            brazelog { "Key or value was null. Not logging custom user attribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    @ReactMethod
    fun setIntCustomUserAttribute(key: String?, value: Int, callback: Callback?) {
        if (key == null) {
            brazelog { "Key or value was null. Not logging custom user attribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    @ReactMethod
    fun setDoubleCustomUserAttribute(key: String?, value: Float, callback: Callback?) {
        if (key == null) {
            brazelog { "Key or value was null. Not logging custom user attribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, value))
        }
    }

    @ReactMethod
    fun setDateCustomUserAttribute(key: String?, timeStamp: Int, callback: Callback?) {
        if (key == null) {
            brazelog { "Key or value was null. Not logging custom user attribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.setCustomUserAttribute(key, timeStamp.toLong()))
        }
    }

    @ReactMethod
    fun incrementCustomUserAttribute(key: String?, incrementValue: Int, callback: Callback?) {
        if (key == null) {
            brazelog { "Key or value was null. Not logging incrementCustomUserAttribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.incrementCustomUserAttribute(key, incrementValue))
        }
    }

    @ReactMethod
    fun unsetCustomUserAttribute(key: String?, callback: Callback?) {
        if (key == null) {
            brazelog { "Key or value was null. Not logging unsetCustomUserAttribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.unsetCustomUserAttribute(key))
        }
    }

    @ReactMethod
    fun setCustomUserAttributeArray(key: String?, value: ReadableArray, callback: Callback?) {
        if (key == null) {
            brazelog { "Key was null. Not logging setCustomUserAttributeArray." }
            return
        }
        val size = value.size()
        val attributeArray = arrayOfNulls<String>(size)
        for (i in 0 until size) {
            attributeArray[i] = value.getString(i)
        }
        runOnUser {
            callback.reportResult(it.setCustomAttributeArray(key, attributeArray))
        }
    }

    @ReactMethod
    fun addToCustomAttributeArray(key: String?, value: String?, callback: Callback?) {
        if (key == null || value == null) {
            brazelog { "Key or value was null. Not logging custom user attribute." }
            return
        }
        runOnUser {
            callback.reportResult(it.addToCustomAttributeArray(key, value))
        }
    }

    @ReactMethod
    fun removeFromCustomAttributeArray(key: String?, value: String?, callback: Callback?) {
        if (key == null || value == null) {
            brazelog { "Key or value was null. Not logging removeFromCustomAttributeArray" }
            return
        }
        runOnUser {
            callback.reportResult(it.removeFromCustomAttributeArray(key, value))
        }
    }

    @ReactMethod
    fun setFirstName(firstName: String?) = runOnUser { it.setFirstName(firstName) }

    @ReactMethod
    fun setLastName(lastName: String?) = runOnUser { it.setLastName(lastName) }

    @ReactMethod
    fun setEmail(email: String?) = runOnUser { it.setLastName(email) }

    @ReactMethod
    fun setGender(gender: String?, callback: Callback?) {
        val genderValue = Gender.getGender(gender?.lowercase(Locale.US) ?: "")
        if (genderValue == null) {
            callback.reportResult(error = "Invalid input $gender. Gender not set.")
            return
        }
        runOnUser { it.setGender(genderValue) }
    }

    @ReactMethod
    fun setDateOfBirth(year: Int, month: Int, day: Int) =
        runOnUser {
            getMonth(month)?.let { monthEnum ->
                it.setDateOfBirth(year, monthEnum, day)
            }
        }

    @ReactMethod
    fun setCountry(country: String?) = runOnUser { it.setCountry(country) }

    @ReactMethod
    fun setHomeCity(homeCity: String?) = runOnUser { it.setHomeCity(homeCity) }

    @ReactMethod
    fun setPhoneNumber(phoneNumber: String?) = runOnUser { it.setPhoneNumber(phoneNumber) }

    @ReactMethod
    fun setLanguage(language: String?) = runOnUser { it.setLanguage(language) }

    @ReactMethod
    fun addToSubscriptionGroup(groupId: String?, callback: Callback?) {
        if (groupId == null) {
            brazelog { "groupId was null. Not logging addToSubscriptionGroup." }
            return
        }
        runOnUser {
            callback.reportResult(it.addToSubscriptionGroup(groupId))
        }
    }

    @ReactMethod
    fun removeFromSubscriptionGroup(groupId: String?, callback: Callback?) {
        if (groupId == null) {
            brazelog { "groupId was null. Not logging removeFromSubscriptionGroup." }
            return
        }
        runOnUser {
            callback.reportResult(it.removeFromSubscriptionGroup(groupId))
        }
    }

    @ReactMethod
    fun setPushNotificationSubscriptionType(subscriptionType: String?, callback: Callback?) {
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

    @ReactMethod
    fun setEmailNotificationSubscriptionType(subscriptionType: String?, callback: Callback?) {
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

    @Suppress("LongParameterList", "UnusedPrivateMember")
    @ReactMethod
    fun setTwitterData(
        id: Int?,
        screenName: String?,
        name: String?,
        description: String?,
        followersCount: Int?,
        friendsCount: Int?,
        statusesCount: Int?,
        profileImageUrl: String?
    ) {
        // no-op
    }

    @Suppress("UnusedPrivateMember")
    @ReactMethod
    fun setFacebookData(facebookUserDictionary: ReadableMap?, numberOfFriends: Int?, likes: ReadableArray?) {
        // no-op
    }

    @ReactMethod
    fun launchNewsFeed() {
        val intent = Intent(currentActivity, AppboyFeedActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        this.reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun launchContentCards() {
        val intent = Intent(currentActivity, ContentCardsActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        this.reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun requestContentCardsRefresh() {
        braze.requestContentCardsRefresh(false)
    }

    @ReactMethod
    fun getContentCards(promise: Promise) {
        val subscriber: IEventSubscriber<ContentCardsUpdatedEvent> = object : IEventSubscriber<ContentCardsUpdatedEvent> {
            override fun trigger(message: ContentCardsUpdatedEvent) {
                promise.resolve(mapContentCards(message.allCards))
                updateContentCardsIfNeeded(message)
                braze.removeSingleSubscription(this, ContentCardsUpdatedEvent::class.java)
            }
        }
        braze.subscribeToContentCardsUpdates(subscriber)
        braze.requestContentCardsRefresh(true)
    }

    @ReactMethod
    fun setSdkAuthenticationSignature(token: String?) {
        if (token != null) {
            braze.setSdkAuthenticationSignature(token)
        }
    }

    @Suppress("UnusedPrivateMember")
    @ReactMethod
    fun requestPushPermission(options: ReadableMap?) = currentActivity.requestPushPermissionPrompt()

    private fun subscribeToContentCardsUpdatedEvent() {
        if (this::contentCardsUpdatedSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                contentCardsUpdatedSubscriber,
                ContentCardsUpdatedEvent::class.java
            )
        }
        contentCardsUpdatedSubscriber = IEventSubscriber { event ->
            val updated = event.timestampSeconds > contentCardsUpdatedAt
            if (updated && reactApplicationContext.hasActiveReactInstance()) {
                reactApplicationContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(CONTENT_CARDS_UPDATED_EVENT_NAME, updated)
            }
            updateContentCardsIfNeeded(event)
        }

        braze.subscribeToContentCardsUpdates(contentCardsUpdatedSubscriber)
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
        if (this::pushNotificationEventSubscriber.isInitialized) {
            braze.removeSingleSubscription(
                pushNotificationEventSubscriber,
                BrazePushEvent::class.java
            )
        }
        pushNotificationEventSubscriber = IEventSubscriber { event ->
            if (!reactApplicationContext.hasActiveReactInstance()) {
                return@IEventSubscriber
            }
            val pushType = when (event.eventType) {
                BrazePushEventType.NOTIFICATION_RECEIVED -> "push_received"
                BrazePushEventType.NOTIFICATION_OPENED -> "push_opened"
                else -> ""
            }
            if (pushType.isBlank()) return@IEventSubscriber
            val eventData = event.notificationPayload

            val data = WritableNativeMap().apply {
                putString("push_event_type", pushType)
                putString("title", eventData.titleText)
                putString("deeplink", eventData.deeplink)
                putString("summary_text", eventData.summaryText)
                putString("image_url", eventData.bigImageUrl)
                putString("raw_android_push_data", eventData.notificationExtras.toString())
            }

            // Convert the bundle into a map
            val returnedKvpMap = WritableNativeMap()
            val kvpData: Bundle = eventData.brazeExtras
            kvpData.keySet()
                // AKA "appboy_image_url"
                .filter { it != Constants.BRAZE_PUSH_BIG_IMAGE_URL_KEY }
                .associateWith { kvpData[it] }
                .forEach { returnedKvpMap.putString(it.key, it.value.toString()) }
            data.putMap("kvp_data", returnedKvpMap)

            brazelog { "Sending push notification event with data $data" }
            reactApplicationContext
                .getJSModule(RCTDeviceEventEmitter::class.java)
                .emit(PUSH_NOTIFICATION_EVENT_NAME, data)
        }
        braze.subscribeToPushNotificationEvents(pushNotificationEventSubscriber)
    }

    @ReactMethod
    fun logContentCardDismissed(id: String) {
        getCardById(id)?.isDismissed = true
    }

    @ReactMethod
    fun logContentCardClicked(id: String) {
        getCardById(id)?.logClick()
    }

    @ReactMethod
    fun logContentCardImpression(id: String) {
        getCardById(id)?.logImpression()
    }

    @ReactMethod
    fun requestFeedRefresh() {
        braze.requestFeedRefresh()
    }

    /**
     * Registers a short-lived FeedUpdatedEvent subscriber, requests
     * a feed refresh from cache, and and returns the
     * requested card count in the callback
     */
    private fun getCardCountForTag(category: String?, callback: Callback, cardCountTag: String) {
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
        var feedUpdatedSubscriber: IEventSubscriber<FeedUpdatedEvent>? = null
        var requestingFeedUpdateFromCache = false

        // Callback blocks (error or result) may only be invoked once, else React Native throws an error.
        when (cardCountTag) {
            CARD_COUNT_TAG -> {
                // getCardCount
                feedUpdatedSubscriber = IEventSubscriber { feedUpdatedEvent ->
                    synchronized(callbackCallLock) {
                        if (callbackCallMap[callback] == null) {
                            callbackCallMap[callback] = true
                            if (category == "all") {
                                callback.reportResult(feedUpdatedEvent.cardCount)
                            } else {
                                callback.reportResult(feedUpdatedEvent.getCardCount(cardCategory))
                            }
                        }
                    }
                    // Remove this listener from the feed subscriber map and from Braze
                    braze.removeSingleSubscription(feedSubscriberMap[callback], FeedUpdatedEvent::class.java)
                    feedSubscriberMap.remove(callback)
                }
                requestingFeedUpdateFromCache = true
            }
            UNREAD_CARD_COUNT_TAG -> {
                // getUnreadCardCount
                feedUpdatedSubscriber = IEventSubscriber { feedUpdatedEvent ->
                    synchronized(callbackCallLock) {
                        if (callbackCallMap[callback] == null) {
                            callbackCallMap[callback] = true
                            if (category == "all") {
                                callback.reportResult(feedUpdatedEvent.unreadCardCount)
                            } else {
                                callback.reportResult(feedUpdatedEvent.getUnreadCardCount(cardCategory))
                            }
                        }
                    }
                    // Remove this listener from the feed subscriber map and from Braze
                    braze.removeSingleSubscription(feedSubscriberMap[callback], FeedUpdatedEvent::class.java)
                    feedSubscriberMap.remove(callback)
                }
                requestingFeedUpdateFromCache = true
            }
        }
        if (requestingFeedUpdateFromCache && feedUpdatedSubscriber != null) {
            // Put the subscriber into a map so we can remove it later from future subscriptions
            feedSubscriberMap[callback] = feedUpdatedSubscriber
            braze.subscribeToFeedUpdates(feedUpdatedSubscriber)
            braze.requestFeedRefreshFromCache()
        }
    }

    @ReactMethod
    fun getCardCountForCategories(category: String?, callback: Callback) =
        getCardCountForTag(category, callback, CARD_COUNT_TAG)

    @ReactMethod
    fun getUnreadCardCountForCategories(category: String?, callback: Callback) =
        getCardCountForTag(category, callback, UNREAD_CARD_COUNT_TAG)

    @ReactMethod
    fun wipeData() = Braze.wipeData(reactApplicationContext)

    @ReactMethod
    fun disableSDK() = Braze.disableSdk(reactApplicationContext)

    @ReactMethod
    fun enableSDK() = Braze.enableSdk(reactApplicationContext)

    @ReactMethod
    fun requestLocationInitialization() = braze.requestLocationInitialization()

    @ReactMethod
    fun requestGeofences(latitude: Double?, longitude: Double?) {
        if (latitude == null ||
            longitude == null
        ) {
            brazelog { "requestGeofences arguments were null. Not requesting." }
            return
        }
        braze.requestGeofences(latitude, longitude)
    }

    @ReactMethod
    fun setLocationCustomAttribute(key: String?, latitude: Double?, longitude: Double?, callback: Callback?) {
        if (key == null ||
            latitude == null ||
            longitude == null
        ) {
            brazelog { "setLocationCustomAttribute arguments were null. Not logging." }
            return
        }
        runOnUser {
            it.setLocationCustomAttribute(key, latitude, longitude)
            // Always return true as Android doesn't support
            // getting a result from setLocationCustomAttribute().
            callback.reportResult(true)
        }
    }

    @ReactMethod
    fun subscribeToInAppMessage(useBrazeUI: Boolean) {
        BrazeInAppMessageManager.getInstance().setCustomInAppMessageManagerListener(object : DefaultInAppMessageManagerListener() {
            override fun beforeInAppMessageDisplayed(inAppMessage: IInAppMessage): InAppMessageOperation {
                val parameters: WritableMap = WritableNativeMap()
                parameters.putString("inAppMessage", inAppMessage.forJsonPut().toString())
                reactApplicationContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(IN_APP_MESSAGE_RECEIVED_EVENT_NAME, parameters)
                return if (useBrazeUI) {
                    InAppMessageOperation.DISPLAY_NOW
                } else {
                    InAppMessageOperation.DISCARD
                }
            }
        })
    }

    @ReactMethod
    fun hideCurrentInAppMessage() = BrazeInAppMessageManager.getInstance().hideCurrentlyDisplayingInAppMessage(true)

    @ReactMethod
    fun logInAppMessageClicked(inAppMessageString: String?) {
        braze.deserializeInAppMessageString(inAppMessageString)?.logClick()
    }

    @ReactMethod
    fun logInAppMessageImpression(inAppMessageString: String?) = braze.deserializeInAppMessageString(inAppMessageString)?.logImpression()

    @ReactMethod
    fun logInAppMessageButtonClicked(inAppMessageString: String?, buttonId: Int) {
        val inAppMessage = braze.deserializeInAppMessageString(inAppMessageString)
        if (inAppMessage is IInAppMessageImmersive) {
            inAppMessage.messageButtons
                .firstOrNull { it.id == buttonId }
                ?.let { inAppMessage.logButtonClick(it) }
        }
    }

    @ReactMethod
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

    @ReactMethod
    fun getInstallTrackingId(callback: Callback?) = callback.reportResult(braze.deviceId)

    private fun runOnUser(block: (user: BrazeUser) -> Unit) {
        braze.getCurrentUser {
            block(it)
        }
    }

    @ReactMethod
    fun setSDKFlavor() {
        // Dummy method required for the iOS SDK flavor implementation; see AppboyReactBridge.setSDKFlavor()
        // in index.js. The Android bridge sets the REACT SDK flavor via a braze.xml parameter.
    }

    @ReactMethod
    fun setMetadata() {
        // Dummy method required for the iOS SDK Metadata implementation; see AppboyReactBridge.setMetadata()
        // in index.js. The Android bridge sets the REACT SDK Metadata field via a braze.xml parameter.
    }

    /**
     * Updates the last known Content Card refresh data
     */
    private fun updateContentCardsIfNeeded(event: ContentCardsUpdatedEvent) {
        if (event.timestampSeconds > contentCardsUpdatedAt) {
            contentCardsUpdatedAt = event.timestampSeconds
            contentCards.clear()
            contentCards.addAll(event.allCards)
        }
    }

    private fun getCardById(id: String): Card? =
        contentCards.firstOrNull { it.id == id }

    companion object {
        private const val CARD_COUNT_TAG = "card count"
        private const val UNREAD_CARD_COUNT_TAG = "unread card count"
        private const val CONTENT_CARDS_UPDATED_EVENT_NAME = "contentCardsUpdated"
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
                        if (mapValue.getString("type") == "UNIX_timestamp") {
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
                        val mapValue = readableArray.getMap(i)
                        if (mapValue.getString("type") == "UNIX_timestamp") {
                            val unixTimestamp = mapValue.getDouble("value")
                            parsedList[i] = Date(unixTimestamp.toLong())
                        } else {
                            parsedList[i] = parseReadableMap(readableArray.getMap(i))
                        }
                    }
                    ReadableType.Array -> {
                        parsedList[i] = parseReadableArray(readableArray.getArray(i))
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
