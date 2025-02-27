package com.braze.reactbridge

import android.content.Context
import android.widget.FrameLayout
import com.braze.ui.banners.BannerView

// Wrapper class to contain the `BannerView`.
// This prevents the web view background from bleeding past its bounds.
class BannerContainer(context: Context) : FrameLayout(context) {
    val bannerView: BannerView = BannerView(context).apply {
        layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT
        )
    }

    init {
        addView(bannerView)
    }
}
