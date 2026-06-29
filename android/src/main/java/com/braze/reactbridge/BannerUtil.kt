package com.braze.reactbridge

import com.braze.models.Banner
import com.braze.reactbridge.util.getMutableArray
import com.braze.reactbridge.util.getMutableMap
import com.braze.ui.banners.BannerDismissSnapshot
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

/**
 * Maps a list of banners to a WritableArray
 * @param bannersList - The list of banners to map
 * @return The mapped banners
 */
fun mapBanners(bannersList: List<Banner>): WritableArray =
    bannersList.fold(getMutableArray()) { acc, banner ->
        acc.apply { pushMap(mapBanner(banner)) }
    }

/**
 * Maps a banner to a WritableMap
 * @param banner - The banner to map
 * @return The mapped banner
 */
fun mapBanner(banner: Banner): WritableMap {
    val mappedBanner = getMutableMap()
    mappedBanner.putString("trackingId", banner.trackingId)
    mappedBanner.putString("placementId", banner.placementId)
    mappedBanner.putString("stableKey", banner.stableKey)
    mappedBanner.putBoolean("isTestSend", banner.isTestSend)
    mappedBanner.putBoolean("isControl", banner.isControl)
    mappedBanner.putString("html", banner.html)

    // Convert to Double when passing to JS layer since timestamp can't fit in a 32-bit
    // int and WriteableNativeMap doesn't support longs because of language limitations
    mappedBanner.putDouble("expiresAt", banner.expirationTimestampSeconds.toDouble())

    banner.properties.let {
        mappedBanner.putMap("properties", it.toNativeMap())
    }

    return mappedBanner
}

/**
 * Maps a dismissed banner snapshot to the public React Native event payload.
 * @param snapshot - The dismissed banner identity from the native BannerView
 * @return The mapped dismissal payload
 */
fun mapBannerDismissSnapshot(snapshot: BannerDismissSnapshot): WritableMap {
    val mappedSnapshot = getMutableMap()
    mappedSnapshot.putString("placementId", snapshot.placementId.orEmpty())
    mappedSnapshot.putString("stableKey", snapshot.stableKey.orEmpty())
    mappedSnapshot.putString("trackingId", snapshot.trackingId.orEmpty())
    return mappedSnapshot
}

/**
 * Determines whether a dismissed banner snapshot has enough identity to notify JavaScript.
 * @param snapshot - The dismissed banner identity from the native BannerView
 * @return True when the dismissal payload can be correlated in JavaScript
 */
fun canDispatchBannerDismissSnapshot(snapshot: BannerDismissSnapshot): Boolean =
    !snapshot.placementId.isNullOrBlank() &&
        !snapshot.stableKey.isNullOrBlank() &&
        !snapshot.trackingId.isNullOrBlank()
