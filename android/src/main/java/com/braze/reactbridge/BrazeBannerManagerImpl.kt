package com.braze.reactbridge

import android.view.View
import com.braze.Braze
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

object BrazeBannerManagerImpl {
    const val NAME = "BrazeBannerView"
    const val EVENT_HEIGHT_CHANGED = "onHeightChanged"
    const val FIELD_HEIGHT = "height"

    class BannerDimensionsEvent(
        surfaceId: Int,
        viewId: Int,
        private val payload: WritableMap
    ) : Event<BannerDimensionsEvent>(surfaceId, viewId) {
        override fun getEventName(): String = EVENT_HEIGHT_CHANGED
        override fun getEventData(): WritableMap? = payload
    }

    fun createViewInstance(context: ThemedReactContext): BannerContainer {
        val container = BannerContainer(context)
        container.bannerView.heightCallback = { height ->
            val reactContext = context as ReactContext
            val surfaceId = UIManagerHelper.getSurfaceId(reactContext)

            var height = height

            // Control banners with `0` height aren't detected for impressions.
            // To prevent this, we set the height to `1` and make it transparent.
            container.bannerView.placementId?.let { placementId ->
                Braze.getInstance(context).getBanner(placementId)
                    .takeIf { it?.isControl == true }
                    ?.run {
                        height = 1.0
                        container.alpha = 0.0f
                    }
            }

            container.postOnAnimation {
                val layoutParams = container.layoutParams

                val newHeight = height.toInt()
                if (layoutParams.height != newHeight) {
                    layoutParams.height = newHeight
                    container.layoutParams = layoutParams
                    container.requestLayout()
                    container.invalidate()

                    // Force parent to acknowledge height change.
                    (container.parent as? View)?.let { parent ->
                        parent.postOnAnimation {
                            parent.requestLayout()
                            parent.invalidate()
                        }
                    }
                }

                // Send height event to React Native.
                val payload = Arguments.createMap().apply {
                    putDouble(FIELD_HEIGHT, height)
                }
                val event = BannerDimensionsEvent(surfaceId, container.id, payload)
                UIManagerHelper.getEventDispatcherForReactTag(reactContext, container.id)?.run {
                    this.dispatchEvent(event)
                }
            }
        }
        return container
    }

    fun setPlacementID(view: BannerContainer, placementID: String?) {
        // Reset the alpha of the container in case the previous placement was a control banner.
        view.alpha = 1.0f
        view.bannerView.placementId = placementID
    }

    fun getExportedCustomBubblingEventTypeConstants(): Map<String?, Any?>? =
        mapOf(
            EVENT_HEIGHT_CHANGED to mapOf(
                "phasedRegistrationNames" to mapOf(
                    "bubbled" to EVENT_HEIGHT_CHANGED,
                    "captured" to EVENT_HEIGHT_CHANGED
                )
            )
        )
}
