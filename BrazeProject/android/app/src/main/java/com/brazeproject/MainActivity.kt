package com.brazeproject

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.braze.support.BrazeLogger.getBrazeLogTag
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.concurrentReactEnabled
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        intent.data?.let { data ->
            Toast.makeText(this, "Activity opened by deep link: $data", Toast.LENGTH_LONG).show()
            Log.i(TAG, "Deep link is $data")
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String  = "BrazeProject"

    /**
     * Returns the instance of the [ReactActivityDelegate]. Here we use a util class [ ] which allows
     * you to easily enable Fabric and Concurrent React (aka React 18) with two boolean flags.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            activity = this,
            mainComponentName = mainComponentName,
            fabricEnabled = fabricEnabled,
        )
    }

    companion object {
        private val TAG = getBrazeLogTag(MainActivity::class.java)
    }
}
