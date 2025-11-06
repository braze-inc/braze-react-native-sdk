package com.brazeproject

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import android.util.Log
import com.braze.BrazeActivityLifecycleCallbackListener
import com.braze.support.BrazeLogger.logLevel

class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
      getDefaultReactHost(
        context = applicationContext,
        packageList =
          PackageList(this).packages.apply {
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // add(MyReactNativePackage())
          },
      )
    }

    override fun onCreate() {
        super.onCreate()
        registerActivityLifecycleCallbacks(BrazeActivityLifecycleCallbackListener())
        logLevel = Log.VERBOSE
        loadReactNative(this)
    }
}
