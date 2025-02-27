package com.braze.reactbridge

import android.view.View
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class BrazeBannerManager(private val callerContext: ReactApplicationContext) :
    SimpleViewManager<BannerContainer>() {

    override fun getName() = BrazeBannerManagerImpl.NAME

    override fun createViewInstance(context: ThemedReactContext): BannerContainer =
        BrazeBannerManagerImpl.createViewInstance(context)

    @ReactProp(name = "placementID")
    fun setPlacementID(view: BannerContainer, placementID: String?) {
        BrazeBannerManagerImpl.setPlacementID(view, placementID)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String?, Any?>? =
        BrazeBannerManagerImpl.getExportedCustomBubblingEventTypeConstants()
}
