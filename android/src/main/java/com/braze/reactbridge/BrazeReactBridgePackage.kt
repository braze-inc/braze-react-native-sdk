package com.braze.reactbridge

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class BrazeReactBridgePackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == BrazeReactBridgeImpl.NAME) {
            BrazeReactBridge(reactContext)
        } else {
            null
        }
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ) = listOf(BrazeBannerManager(reactContext))

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            moduleInfos[BrazeReactBridgeImpl.NAME] = ReactModuleInfo(
                name = BrazeReactBridgeImpl.NAME,
                className = BrazeReactBridgeImpl.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
            moduleInfos
        }
    }
}
