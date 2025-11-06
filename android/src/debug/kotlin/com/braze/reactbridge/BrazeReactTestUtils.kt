package com.braze.reactbridge

import android.os.Build
import android.os.Looper.getMainLooper
import com.braze.models.Banner
import com.braze.models.FeatureFlag
import org.json.JSONObject
import org.junit.Assert.assertNotNull
import org.robolectric.Shadows.shadowOf
import java.lang.reflect.Constructor
import java.util.Random
import java.util.UUID
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

private val random = Random()

@OptIn(ExperimentalContracts::class)
fun ktAssertNotNull(thing: Any?, failureMessage: String? = null) {
    contract {
        returns() implies (thing != null)
    }
    assertNotNull(failureMessage, thing)
}

/**
 * Waits until the given condition is true
 */
fun blockUntil(idleSleepTimeMs: Long = 10, condition: () -> Boolean) {
    if (Build.FINGERPRINT == "robolectric") {
        // Execute all tasks posted to main looper
        shadowOf(getMainLooper()).idle()
    }

    while (!condition()) {
        // Do nothing
        Thread.sleep(idleSleepTimeMs)
    }
}

fun getRandomString(prefix: String = ""): String = "$prefix${UUID.randomUUID()}".trim()

fun getRandomBoolean(): Boolean = random.nextBoolean()

fun getRandomInt(): Int = random.nextInt()

/**
 * Helper function to access private fields using reflection
 */
fun getPrivateField(obj: Any, fieldName: String): Any? {
    val field = obj.javaClass.getDeclaredField(fieldName)
    field.isAccessible = true
    return field.get(obj)
}

/**
 * Create a new banner instance
 * @param trackingId - The tracking id of the banner
 * @param placementId - The placement id of the banner
 * @param html - The html of the banner
 * @param isTestSend - Whether the banner is a test send
 * @param expirationTimestampSeconds - The expiration timestamp of the banner
 * @param isControl - Whether the banner is a control banner
 * @param properties - The properties of the banner
 * @return The created banner
 */
@Suppress("LongParameterList")
fun createBanner(
    trackingId: String,
    placementId: String,
    html: String,
    isTestSend: Boolean,
    expirationTimestampSeconds: Long,
    isControl: Boolean,
    properties: JSONObject
): Banner = bannerConstructor.newInstance(
    trackingId,
    placementId,
    html,
    isControl,
    expirationTimestampSeconds,
    isTestSend,
    properties
)

/**
 * Helper function to create new feature flag instance
 * @param id - The id of the feature flag
 * @param enabled - Whether the feature flag is enabled
 * @param propertiesJson - The properties of the feature flag
 * @param trackingString - The tracking string of the feature flag
 * @return The created feature flag
 */
fun createFeatureFlag(
    id: String,
    enabled: Boolean,
    propertiesJson: String,
    trackingString: String? = null
): FeatureFlag = featureFlagConstructor.newInstance(
    id, enabled, propertiesJson, trackingString
)

/**
 * Create our own constructor for Banner using reflection
 */
private val bannerConstructor: Constructor<Banner> = Banner::class.java.getDeclaredConstructor(
    String::class.java,
    String::class.java,
    String::class.java,
    Boolean::class.javaPrimitiveType,
    Long::class.java,
    Boolean::class.javaPrimitiveType,
    JSONObject::class.java
).apply {
    isAccessible = true
}

/**
 * Create our own constructor for FeatureFlag using reflection
 */
private val featureFlagConstructor: Constructor<FeatureFlag> =
    FeatureFlag::class.java.getDeclaredConstructor(
        String::class.java,
        Boolean::class.javaPrimitiveType,
        String::class.java,
        String::class.java
    ).apply {
        isAccessible = true
    }
