package com.braze.reactbridge

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class BrazeBannerManager(@Suppress("UNUSED_PARAMETER") private val callerContext: ReactApplicationContext) :
    SimpleViewManager<BannerContainer>() {

    override fun getName() = BrazeBannerManagerImpl.NAME

    override fun createViewInstance(context: ThemedReactContext): BannerContainer =
        BrazeBannerManagerImpl.createViewInstance(context)

    @ReactProp(name = "placementId")
    fun setPlacementId(view: BannerContainer, placementId: String?) {
        BrazeBannerManagerImpl.setPlacementId(view, placementId)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String?, Any?>? =
        BrazeBannerManagerImpl.getExportedCustomBubblingEventTypeConstants()
}
