package com.braze.reactbridge

import com.braze.models.Banner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

fun mapBanners(bannersList: List<Banner>): WritableArray {
    val banners = Arguments.createArray()
    for (banner in bannersList.toTypedArray()) {
        banners.pushMap(mapBanner(banner))
    }
    return banners
}

fun mapBanner(banner: Banner): WritableMap {
    val mappedBanner = Arguments.createMap()
    mappedBanner.putString("trackingId", banner.trackingId)
    mappedBanner.putString("placementId", banner.placementId)
    mappedBanner.putBoolean("isTestSend", banner.isTestSend)
    mappedBanner.putBoolean("isControl", banner.isControl)
    mappedBanner.putString("html", banner.html)
    // Convert to Double when passing to JS layer since timestamp can't fit in a 32-bit
    // int and WriteableNativeMap doesn't support longs because of language limitations
    mappedBanner.putDouble("expiresAt", banner.expirationTimestampSeconds.toDouble())
    // Only call jsonToNativeMap if properties is not null, otherwise pass null
    banner.properties?.let {
        mappedBanner.putMap("properties", jsonToNativeMap(it))
    } ?: mappedBanner.putNull("properties")

    return mappedBanner
}
