@file:Suppress("WildcardImport")

package com.braze.reactbridge

import com.facebook.react.bridge.*

@Suppress("TooManyFunctions", "LargeClass", "UnusedParameter")
class BrazeReactBridge(reactContext: ReactApplicationContext?) : ReactContextBaseJavaModule(reactContext) {
    private val brazeImpl = BrazeReactBridgeImpl(reactContext!!, reactContext.currentActivity)

    override fun getName() = BrazeReactBridgeImpl.NAME

    @ReactMethod
    fun getInitialURL(@Suppress("UNUSED_PARAMETER") callback: Callback) {
        // iOS only
    }

    @ReactMethod
    fun getInitialPushPayload(@Suppress("UNUSED_PARAMETER") callback: Callback) {
        // iOS only
    }

    @ReactMethod
    fun getDeviceId(callback: Callback) {
        return brazeImpl.getDeviceId(callback)
    }

    @ReactMethod
    fun changeUser(userId: String, signature: String?) {
        brazeImpl.changeUser(userId, signature)
    }

    @ReactMethod
    fun getUserId(callback: Callback) {
        return brazeImpl.getUserId(callback)
    }

    @ReactMethod
    fun setSdkAuthenticationSignature(signature: String) {
        brazeImpl.setSdkAuthenticationSignature(signature)
    }

    @ReactMethod
    fun addAlias(aliasName: String, aliasLabel: String) {
        brazeImpl.addAlias(aliasName, aliasLabel)
    }

    @ReactMethod
    fun setFirstName(firstName: String?) {
        brazeImpl.setFirstName(firstName)
    }

    @ReactMethod
    fun setLastName(lastName: String?) {
        brazeImpl.setLastName(lastName)
    }

    @ReactMethod
    fun setEmail(email: String?) {
        brazeImpl.setEmail(email)
    }

    @ReactMethod
    fun setGender(gender: String?, callback: Callback?) {
        brazeImpl.setGender(gender, callback)
    }

    @ReactMethod
    fun setLanguage(language: String?) {
        brazeImpl.setLanguage(language)
    }

    @ReactMethod
    fun setCountry(country: String?) {
        brazeImpl.setCountry(country)
    }

    @ReactMethod
    fun setHomeCity(homeCity: String?) {
        brazeImpl.setHomeCity(homeCity)
    }

    @ReactMethod
    fun setPhoneNumber(phoneNumber: String?) {
        brazeImpl.setPhoneNumber(phoneNumber)
    }

    @ReactMethod
    fun setDateOfBirth(year: Double, month: Double, day: Double) {
        brazeImpl.setDateOfBirth(year.toInt(), month.toInt(), day.toInt())
    }

    @ReactMethod
    fun registerPushToken(token: String) {
        brazeImpl.registerPushToken(token)
    }

    @ReactMethod
    fun addToSubscriptionGroup(groupId: String, callback: Callback?) {
        brazeImpl.addToSubscriptionGroup(groupId, callback)
    }

    @ReactMethod
    fun removeFromSubscriptionGroup(groupId: String, callback: Callback?) {
        brazeImpl.removeFromSubscriptionGroup(groupId, callback)
    }

    @ReactMethod
    fun setPushNotificationSubscriptionType(
        notificationSubscriptionType: String,
        callback: Callback?
    ) {
        brazeImpl.setPushNotificationSubscriptionType(notificationSubscriptionType, callback)
    }

    @ReactMethod
    fun setEmailNotificationSubscriptionType(
        notificationSubscriptionType: String,
        callback: Callback?
    ) {
        brazeImpl.setEmailNotificationSubscriptionType(notificationSubscriptionType, callback)
    }

    @ReactMethod
    fun logCustomEvent(eventName: String, eventProperties: ReadableMap?) {
        brazeImpl.logCustomEvent(eventName, eventProperties)
    }

    @ReactMethod
    fun logPurchase(
        productId: String,
        price: String,
        currencyCode: String,
        quantity: Double,
        purchaseProperties: ReadableMap?
    ) {
        brazeImpl.logPurchase(productId, price, currencyCode, quantity.toInt(), purchaseProperties)
    }

    @ReactMethod
    fun setIntCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.setIntCustomUserAttribute(key, value.toInt(), callback)
    }

    @ReactMethod
    fun setDoubleCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.setDoubleCustomUserAttribute(key, value.toFloat(), callback)
    }

    @ReactMethod
    fun setBoolCustomUserAttribute(key: String, value: Boolean, callback: Callback?) {
        brazeImpl.setBoolCustomUserAttribute(key, value, callback)
    }

    @ReactMethod
    fun setStringCustomUserAttribute(key: String, value: String, callback: Callback?) {
        brazeImpl.setStringCustomUserAttribute(key, value, callback)
    }

    @ReactMethod
    fun setCustomUserAttributeArray(
        key: String,
        value: ReadableArray,
        callback: Callback?
    ) {
        brazeImpl.setCustomUserAttributeArray(key, value, callback)
    }

    @ReactMethod
    fun setCustomUserAttributeObjectArray(
        key: String,
        value: ReadableArray,
        callback: Callback?
    ) {
        brazeImpl.setCustomUserAttributeObjectArray(key, value, callback)
    }

    @ReactMethod
    fun setDateCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.setDateCustomUserAttribute(key, value.toInt(), callback)
    }

    @ReactMethod
    fun setCustomUserAttributeObject(key: String?, value: ReadableMap?, merge: Boolean, callback: Callback?) {
        brazeImpl.setCustomUserAttributeObject(key, value, merge, callback)
    }

    @ReactMethod
    fun addToCustomUserAttributeArray(key: String, value: String, callback: Callback?) {
        brazeImpl.addToCustomAttributeArray(key, value, callback)
    }

    @ReactMethod
    fun removeFromCustomUserAttributeArray(
        key: String,
        value: String,
        callback: Callback?
    ) {
        brazeImpl.removeFromCustomAttributeArray(key, value, callback)
    }

    @ReactMethod
    fun unsetCustomUserAttribute(key: String, callback: Callback?) {
        brazeImpl.unsetCustomUserAttribute(key, callback)
    }

    @ReactMethod
    fun incrementCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.incrementCustomUserAttribute(key, value.toInt(), callback)
    }

    @ReactMethod
    fun setAttributionData(
        network: String?,
        campaign: String?,
        adGroup: String?,
        creative: String?
    ) {
        brazeImpl.setAttributionData(network, campaign, adGroup, creative)
    }

    @ReactMethod
    fun launchContentCards(dismissAutomaticallyOnCardClick: Boolean) {
        brazeImpl.launchContentCards(dismissAutomaticallyOnCardClick)
    }

    @ReactMethod
    fun requestContentCardsRefresh() {
        brazeImpl.requestContentCardsRefresh()
    }

    @ReactMethod
    fun logContentCardClicked(cardId: String) {
        brazeImpl.logContentCardClicked(cardId)
    }

    @ReactMethod
    fun logContentCardDismissed(cardId: String) {
        brazeImpl.logContentCardDismissed(cardId)
    }

    @ReactMethod
    fun logContentCardImpression(cardId: String) {
        brazeImpl.logContentCardImpression(cardId)
    }

    @ReactMethod
    fun processContentCardClickAction(cardId: String) {
        brazeImpl.processContentCardClickAction(cardId)
    }

    @ReactMethod
    fun getContentCards(promise: Promise) {
        brazeImpl.getContentCards(promise)
    }

    @ReactMethod
    fun getCachedContentCards(promise: Promise) {
        brazeImpl.getCachedContentCards(promise)
    }

    @ReactMethod
    fun getBanner(placementId: String, promise: Promise) {
        brazeImpl.getBanner(placementId, promise)
    }

    @ReactMethod
    fun requestBannersRefresh(placementIds: ReadableArray) {
        brazeImpl.requestBannersRefresh(placementIds)
    }

    @ReactMethod
    fun requestImmediateDataFlush() {
        brazeImpl.requestImmediateDataFlush()
    }

    @ReactMethod
    fun wipeData() {
        brazeImpl.wipeData()
    }

    @ReactMethod
    fun disableSDK() {
        brazeImpl.disableSDK()
    }

    @ReactMethod
    fun enableSDK() {
        brazeImpl.enableSDK()
    }

    @ReactMethod
    fun requestLocationInitialization() {
        brazeImpl.requestLocationInitialization()
    }

    @ReactMethod
    fun requestGeofences(latitude: Double, longitude: Double) {
        brazeImpl.requestGeofences(latitude, longitude)
    }

    @ReactMethod
    fun setLocationCustomAttribute(
        key: String,
        latitude: Double,
        longitude: Double,
        callback: Callback?
    ) {
        brazeImpl.setLocationCustomAttribute(key, latitude, longitude, callback)
    }

    @ReactMethod
    fun setLastKnownLocation(
        latitude: Double,
        longitude: Double,
        altitude: Double,
        horizontalAccuracy: Double,
        verticalAccuracy: Double
    ) {
        brazeImpl.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy)
    }

    @ReactMethod
    fun subscribeToInAppMessage(useBrazeUI: Boolean, @Suppress("UNUSED_PARAMETER") callback: Callback?) {
        brazeImpl.subscribeToInAppMessage(useBrazeUI)
    }

    @ReactMethod
    fun hideCurrentInAppMessage() {
        brazeImpl.hideCurrentInAppMessage()
    }

    @ReactMethod
    fun logInAppMessageClicked(inAppMessageString: String) {
        brazeImpl.logInAppMessageClicked(inAppMessageString)
    }

    @ReactMethod
    fun logInAppMessageImpression(inAppMessageString: String) {
        brazeImpl.logInAppMessageImpression(inAppMessageString)
    }

    @ReactMethod
    fun logInAppMessageButtonClicked(inAppMessageString: String, buttonId: Double) {
        brazeImpl.logInAppMessageButtonClicked(inAppMessageString, buttonId.toInt())
    }

    @ReactMethod
    fun performInAppMessageAction(inAppMessageString: String, buttonId: Double) {
        brazeImpl.performInAppMessageAction(inAppMessageString, buttonId.toInt())
    }

    @ReactMethod
    fun requestPushPermission(permissionOptions: ReadableMap?) {
        brazeImpl.requestPushPermission(permissionOptions)
    }

    @ReactMethod
    fun getAllFeatureFlags(promise: Promise) {
        brazeImpl.getAllFeatureFlags(promise)
    }

    @ReactMethod
    fun getFeatureFlag(flagId: String, promise: Promise) {
        brazeImpl.getFeatureFlag(flagId, promise)
    }

    @Deprecated("Use getBooleanProperty instead")
    @ReactMethod
    fun getFeatureFlagBooleanProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagBooleanProperty(flagId, key, promise)
    }

    @Deprecated("Use getStringProperty instead")
    @ReactMethod
    fun getFeatureFlagStringProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagStringProperty(flagId, key, promise)
    }

    @Deprecated("Use getNumberProperty instead")
    @ReactMethod
    fun getFeatureFlagNumberProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagNumberProperty(flagId, key, promise)
    }

    @Deprecated("Use getTimestampProperty instead")
    @ReactMethod
    fun getFeatureFlagTimestampProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagTimestampProperty(flagId, key, promise)
    }

    @Deprecated("Use getJSONProperty instead")
    @ReactMethod
    fun getFeatureFlagJSONProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagJSONProperty(flagId, key, promise)
    }

    @Deprecated("Use getImageProperty instead")
    @ReactMethod
    fun getFeatureFlagImageProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagImageProperty(flagId, key, promise)
    }

    @ReactMethod
    fun refreshFeatureFlags() {
        brazeImpl.refreshFeatureFlags()
    }

    @ReactMethod
    fun logFeatureFlagImpression(id: String) {
        brazeImpl.logFeatureFlagImpression(id)
    }

    @ReactMethod
    fun setAdTrackingEnabled(adTrackingEnabled: Boolean, googleAdvertisingId: String?) {
        brazeImpl.setAdTrackingEnabled(adTrackingEnabled, googleAdvertisingId)
    }

    @ReactMethod
    fun setIdentifierForAdvertiser(@Suppress("UNUSED_PARAMETER") identifierForAdvertiser: String) {
        // iOS only
    }

    @ReactMethod
    fun setIdentifierForVendor(@Suppress("UNUSED_PARAMETER") identifierForVendor: String) {
        // iOS only
    }

    @ReactMethod
    fun updateTrackingPropertyAllowList(@Suppress("UNUSED_PARAMETER") allowList: ReadableMap) {
        // iOS only
    }

    @ReactMethod
    fun addListener(eventType: String) {
        brazeImpl.addListener(eventType)
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        brazeImpl.removeListeners(count.toInt())
    }
}
