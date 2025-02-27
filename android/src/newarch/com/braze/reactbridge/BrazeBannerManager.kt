package com.braze.reactbridge

import android.view.View
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.BrazeBannerViewManagerDelegate
import com.facebook.react.viewmanagers.BrazeBannerViewManagerInterface

@ReactModule(name = BrazeBannerManagerImpl.NAME)
class BrazeBannerManager(context: ReactApplicationContext) : SimpleViewManager<BannerContainer>(), BrazeBannerViewManagerInterface<BannerContainer> {

    private val delegate: BrazeBannerViewManagerDelegate<BannerContainer, BrazeBannerManager> =
        BrazeBannerViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<BannerContainer> = delegate

    override fun getName(): String = BrazeBannerManagerImpl.NAME

    override fun createViewInstance(context: ThemedReactContext): BannerContainer =
        BrazeBannerManagerImpl.createViewInstance(context)

    @ReactProp(name = "placementID")
    override fun setPlacementID(view: BannerContainer, placementID: String?) {
        BrazeBannerManagerImpl.setPlacementID(view, placementID)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String?, Any?>? =
        BrazeBannerManagerImpl.getExportedCustomBubblingEventTypeConstants()
}
