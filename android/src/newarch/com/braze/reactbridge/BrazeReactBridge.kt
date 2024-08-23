package com.braze.reactbridge

import com.facebook.react.bridge.*

class BrazeReactBridge(reactContext: ReactApplicationContext): NativeBrazeReactModuleSpec(reactContext) {
    val brazeImpl = BrazeReactBridgeImpl(reactContext, currentActivity)

    override fun getName(): String {
        return BrazeReactBridgeImpl.NAME
    }

    override fun getInitialURL(callback: Callback) {
        // iOS only
    }

    override fun getDeviceId(callback: Callback) {
        return brazeImpl.getDeviceId(callback)
    }

    override fun changeUser(userId: String, signature: String?) {
        brazeImpl.changeUser(userId, signature)
    }

    override fun getUserId(callback: Callback) {
        return brazeImpl.getUserId(callback)
    }

    override fun setSdkAuthenticationSignature(signature: String) {
        brazeImpl.setSdkAuthenticationSignature(signature)
    }

    override fun addAlias(aliasName: String, aliasLabel: String) {
        brazeImpl.addAlias(aliasName, aliasLabel)
    }

    override fun setFirstName(firstName: String) {
        brazeImpl.setFirstName(firstName)
    }

    override fun setLastName(lastName: String) {
        brazeImpl.setLastName(lastName)
    }

    override fun setEmail(email: String) {
        brazeImpl.setEmail(email)
    }

    override fun setGender(gender: String, callback: Callback?) {
        brazeImpl.setGender(gender, callback)
    }

    override fun setLanguage(language: String) {
        brazeImpl.setLanguage(language)
    }

    override fun setCountry(country: String) {
        brazeImpl.setCountry(country)
    }

    override fun setHomeCity(homeCity: String) {
        brazeImpl.setHomeCity(homeCity)
    }

    override fun setPhoneNumber(phoneNumber: String) {
        brazeImpl.setPhoneNumber(phoneNumber)
    }

    override fun setDateOfBirth(year: Double, month: Double, day: Double) {
        brazeImpl.setDateOfBirth(year.toInt(), month.toInt(), day.toInt())
    }

    override fun registerPushToken(token: String) {
        brazeImpl.registerPushToken(token)
    }

    override fun addToSubscriptionGroup(groupId: String, callback: Callback?) {
        brazeImpl.addToSubscriptionGroup(groupId, callback)
    }

    override fun removeFromSubscriptionGroup(groupId: String, callback: Callback?) {
        brazeImpl.removeFromSubscriptionGroup(groupId, callback)
    }

    override fun setPushNotificationSubscriptionType(
        notificationSubscriptionType: String,
        callback: Callback?
    ) {
        brazeImpl.setPushNotificationSubscriptionType(notificationSubscriptionType, callback)
    }

    override fun setEmailNotificationSubscriptionType(
        notificationSubscriptionType: String,
        callback: Callback?
    ) {
        brazeImpl.setEmailNotificationSubscriptionType(notificationSubscriptionType, callback)
    }

    override fun logCustomEvent(eventName: String, eventProperties: ReadableMap?) {
        brazeImpl.logCustomEvent(eventName, eventProperties)
    }

    override fun logPurchase(
        productId: String,
        price: String,
        currencyCode: String,
        quantity: Double,
        purchaseProperties: ReadableMap?
    ) {
        brazeImpl.logPurchase(productId, price, currencyCode, quantity.toInt(), purchaseProperties)
    }

    override fun setIntCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.setIntCustomUserAttribute(key, value.toInt(), callback)
    }

    override fun setDoubleCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.setDoubleCustomUserAttribute(key, value.toFloat(), callback)
    }

    override fun setBoolCustomUserAttribute(key: String, value: Boolean, callback: Callback?) {
        brazeImpl.setBoolCustomUserAttribute(key, value, callback)
    }

    override fun setStringCustomUserAttribute(key: String, value: String, callback: Callback?) {
        brazeImpl.setStringCustomUserAttribute(key, value, callback)
    }

    override fun setCustomUserAttributeArray(
        key: String,
        value: ReadableArray,
        callback: Callback?
    ) {
        brazeImpl.setCustomUserAttributeArray(key, value, callback)
    }

    override fun setCustomUserAttributeObjectArray(
        key: String,
        value: ReadableArray,
        callback: Callback?
    ) {
        brazeImpl.setCustomUserAttributeObjectArray(key, value, callback)
    }

    override fun setDateCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.setDateCustomUserAttribute(key, value.toInt(), callback)
    }

    override fun setCustomUserAttributeObject(key: String?, value: ReadableMap?, merge: Boolean, callback: Callback?) {
        brazeImpl.setCustomUserAttributeObject(key, value, merge, callback)
    }

    override fun addToCustomUserAttributeArray(key: String, value: String, callback: Callback?) {
        brazeImpl.addToCustomAttributeArray(key, value, callback)
    }

    override fun removeFromCustomUserAttributeArray(
        key: String,
        value: String,
        callback: Callback?
    ) {
        brazeImpl.removeFromCustomAttributeArray(key, value, callback)
    }

    override fun unsetCustomUserAttribute(key: String, callback: Callback?) {
        brazeImpl.unsetCustomUserAttribute(key, callback)
    }

    override fun incrementCustomUserAttribute(key: String, value: Double, callback: Callback?) {
        brazeImpl.incrementCustomUserAttribute(key, value.toInt(), callback)
    }

    override fun setAttributionData(
        network: String?,
        campaign: String?,
        adGroup: String?,
        creative: String?
    ) {
        brazeImpl.setAttributionData(network, campaign, adGroup, creative)
    }

    override fun launchNewsFeed() {
        brazeImpl.launchNewsFeed()
    }

    override fun logNewsFeedCardClicked(cardId: String) {
        brazeImpl.logNewsFeedCardClicked(cardId)
    }

    override fun logNewsFeedCardImpression(cardId: String) {
        brazeImpl.logNewsFeedCardImpression(cardId)
    }

    override fun getNewsFeedCards(promise: Promise) {
        brazeImpl.getNewsFeedCards(promise)
    }

    override fun launchContentCards(dismissAutomaticallyOnCardClick: Boolean) {
        brazeImpl.launchContentCards(dismissAutomaticallyOnCardClick)
    }

    override fun requestContentCardsRefresh() {
        brazeImpl.requestContentCardsRefresh()
    }

    override fun logContentCardClicked(cardId: String) {
        brazeImpl.logContentCardClicked(cardId)
    }

    override fun logContentCardDismissed(cardId: String) {
        brazeImpl.logContentCardDismissed(cardId)
    }

    override fun logContentCardImpression(cardId: String) {
        brazeImpl.logContentCardImpression(cardId)
    }

    override fun processContentCardClickAction(cardId: String) {
        brazeImpl.processContentCardClickAction(cardId)
    }

    override fun getContentCards(promise: Promise) {
        brazeImpl.getContentCards(promise)
    }

    override fun getCachedContentCards(promise: Promise) {
        brazeImpl.getCachedContentCards(promise)
    }

    override fun getCardCountForCategories(category: String, callback: Callback?) {
        brazeImpl.getCardCountForCategories(category, callback)
    }

    override fun getUnreadCardCountForCategories(category: String, callback: Callback?) {
        brazeImpl.getUnreadCardCountForCategories(category, callback)
    }

    override fun requestFeedRefresh() {
        brazeImpl.requestFeedRefresh()
    }

    override fun requestImmediateDataFlush() {
        brazeImpl.requestImmediateDataFlush()
    }

    override fun wipeData() {
        brazeImpl.wipeData()
    }

    override fun disableSDK() {
        brazeImpl.disableSDK()
    }

    override fun enableSDK() {
        brazeImpl.enableSDK()
    }

    override fun requestLocationInitialization() {
        brazeImpl.requestLocationInitialization()
    }

    override fun requestGeofences(latitude: Double, longitude: Double) {
        brazeImpl.requestGeofences(latitude, longitude)
    }

    override fun setLocationCustomAttribute(
        key: String,
        latitude: Double,
        longitude: Double,
        callback: Callback?
    ) {
        brazeImpl.setLocationCustomAttribute(key, latitude, longitude, callback)
    }

    override fun setLastKnownLocation(
        latitude: Double,
        longitude: Double,
        altitude: Double,
        horizontalAccuracy: Double,
        verticalAccuracy: Double
    ) {
        brazeImpl.setLastKnownLocation(latitude, longitude, altitude, horizontalAccuracy, verticalAccuracy)
    }

    override fun subscribeToInAppMessage(useBrazeUI: Boolean, callback: Callback?) {
        brazeImpl.subscribeToInAppMessage(useBrazeUI)
    }

    override fun hideCurrentInAppMessage() {
        brazeImpl.hideCurrentInAppMessage()
    }

    override fun logInAppMessageClicked(inAppMessageString: String) {
        brazeImpl.logInAppMessageClicked(inAppMessageString)
    }

    override fun logInAppMessageImpression(inAppMessageString: String) {
        brazeImpl.logInAppMessageImpression(inAppMessageString)
    }

    override fun logInAppMessageButtonClicked(inAppMessageString: String, buttonId: Double) {
        brazeImpl.logInAppMessageButtonClicked(inAppMessageString, buttonId.toInt())
    }

    override fun performInAppMessageAction(inAppMessageString: String, buttonId: Double) {
        brazeImpl.performInAppMessageAction(inAppMessageString, buttonId.toInt())
    }

    override fun requestPushPermission(permissionOptions: ReadableMap?) {
        brazeImpl.requestPushPermission(permissionOptions)
    }

    override fun getAllFeatureFlags(promise: Promise) {
        brazeImpl.getAllFeatureFlags(promise)
    }

    override fun getFeatureFlag(flagId: String, promise: Promise) {
        brazeImpl.getFeatureFlag(flagId, promise)
    }

    override fun getFeatureFlagBooleanProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagBooleanProperty(flagId, key, promise)
    }

    override fun getFeatureFlagStringProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagStringProperty(flagId, key, promise)
    }

    override fun getFeatureFlagNumberProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagNumberProperty(flagId, key, promise)
    }

    override fun getFeatureFlagTimestampProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagTimestampProperty(flagId, key, promise)
    }

    override fun getFeatureFlagJSONProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagJSONProperty(flagId, key, promise)
    }

    override fun getFeatureFlagImageProperty(flagId: String, key: String, promise: Promise) {
        brazeImpl.getFeatureFlagImageProperty(flagId, key, promise)
    }

    override fun refreshFeatureFlags() {
        brazeImpl.refreshFeatureFlags()
    }

    override fun logFeatureFlagImpression(id: String) {
        brazeImpl.logFeatureFlagImpression(id)
    }

    override fun setAdTrackingEnabled(adTrackingEnabled: Boolean, googleAdvertisingId: String) {
        brazeImpl.setAdTrackingEnabled(adTrackingEnabled, googleAdvertisingId)
    }

    override fun updateTrackingPropertyAllowList(allowList: ReadableMap) {
        // iOS only
    }

    override fun addListener(eventType: String) {
        brazeImpl.addListener(eventType)
    }

    override fun removeListeners(count: Double) {
        brazeImpl.removeListeners(count.toInt())
    }

}
