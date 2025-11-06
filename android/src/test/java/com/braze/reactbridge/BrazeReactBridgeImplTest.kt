@file:Suppress("UNCHECKED_CAST", "DEPRECATION")

package com.braze.reactbridge

import android.app.Activity
import com.braze.Braze
import com.braze.BrazeUser
import com.braze.configuration.BrazeConfig
import com.braze.enums.BrazePushEventType
import com.braze.enums.Gender
import com.braze.enums.Month
import com.braze.enums.NotificationSubscriptionType
import com.braze.events.IValueCallback
import com.braze.models.FeatureFlag
import com.braze.models.cards.Card
import com.braze.models.inappmessage.IInAppMessage
import com.braze.models.inappmessage.InAppMessageImmersiveBase
import com.braze.models.inappmessage.MessageButton
import com.braze.models.outgoing.AttributionData
import com.braze.support.nowInSeconds
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableMapKeySetIterator
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Ignore
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import java.math.BigDecimal
import kotlin.random.Random

@Suppress("LargeClass")
class BrazeReactBridgeImplTest : BrazeRobolectricTestBase() {
    private lateinit var brazeReactBridgeImpl: BrazeReactBridgeImpl

    @Before
    fun setup() {
        val reactAppContext = TestReactApplicationContext()
        val brazeConfig = BrazeConfig.Builder()
            .setApiKey("test-api-key")
            .build()
        Braze.configure(reactAppContext, brazeConfig)
        brazeReactBridgeImpl = BrazeReactBridgeImpl(reactAppContext, mock<Activity>())
    }

    @Test
    fun whenBridgeRequestImmediateDataFlushIsCalled_requestImmediateDataFlushGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.requestImmediateDataFlush()
        verify(brazeMock).requestImmediateDataFlush()
    }

    @Test
    fun whenBridgeChangeUserIsCalled_userGetsChanged() {
        val userId = Random.nextInt().toString()
        brazeReactBridgeImpl.changeUser(userId, null)

        val currentUser = brazeReactBridgeImpl.braze.currentUser
        ktAssertNotNull(currentUser)
        assertEquals(userId, currentUser.userId)
    }

    @Test
    fun whenBridgeGetUserIdIsCalled_callbackReceivesUserId() {
        var callbackResult: String? = null
        var callbackInvoked = false

        val testUserId = Random.nextInt().toString()
        brazeReactBridgeImpl.changeUser(testUserId, null)

        val callback = createTestCallback<String, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.getUserId(callback)
        blockUntil { callbackInvoked }

        assertTrue(callbackInvoked)
        assertEquals(testUserId, callbackResult)
    }

    @Test
    fun whenAddAliasIsCalledWithValidAlias_addAliasGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val aliasName = Random.nextInt().toString()
        val aliasLabel = Random.nextInt().toString()
        brazeReactBridgeImpl.addAlias(aliasName, aliasLabel)
        verify(brazeUserMock).addAlias(aliasName, aliasLabel)
    }

    @Test
    fun whenAddAliasIsCalledWithInvalidAlias_addAliasDoesNotGetCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.addAlias("name", "")
        verify(brazeUserMock, never()).addAlias(any(), any())

        brazeReactBridgeImpl.addAlias("", "label")
        verify(brazeUserMock, never()).addAlias(any(), any())
    }

    @Test
    fun whenBridgeRegisterPushTokenIsCalled_pushTokenGetsUpdated() {
        val pushToken = Random.nextInt().toString()
        brazeReactBridgeImpl.registerPushToken(pushToken)
        assertEquals(pushToken, brazeReactBridgeImpl.braze.registeredPushToken)
    }

    @Test
    fun whenBridgeLogCustomEventIsCalled_brazeLogCustomEventGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val eventName = Random.nextInt().toString()
        brazeReactBridgeImpl.logCustomEvent(eventName, null)
        verify(brazeMock).logCustomEvent(eventName, null)
    }

    @Test
    fun whenBridgeLogPurchaseIsCalled_brazeLogPurchaseGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val productId = Random.nextInt().toString()
        val price = Random.nextInt().toString()
        val currencyCode = Random.nextInt().toString()
        val quantity = Random.nextInt()
        brazeReactBridgeImpl.logPurchase(productId, price, currencyCode, quantity, null)
        verify(brazeMock).logPurchase(productId, currencyCode, BigDecimal(price), quantity, null)
    }

    @Test
    fun whenSetStringCustomUserAttributeIsCalled_setCustomUserAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testValue = Random.nextInt().toString()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { setCustomUserAttribute(testKey, testValue) } doReturn expectedResult
        }
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setStringCustomUserAttribute(testKey, testValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setCustomUserAttribute(testKey, testValue)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenSetBoolCustomUserAttributeIsCalled_setCustomUserAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testValue = Random.nextBoolean()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { setCustomUserAttribute(testKey, testValue) } doReturn expectedResult
        }
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setBoolCustomUserAttribute(testKey, testValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setCustomUserAttribute(testKey, testValue)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenSetIntCustomUserAttributeIsCalled_setCustomUserAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testValue = Random.nextInt()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { setCustomUserAttribute(testKey, testValue) } doReturn expectedResult
        }
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setIntCustomUserAttribute(testKey, testValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setCustomUserAttribute(testKey, testValue)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenSetDoubleCustomUserAttributeIsCalled_setCustomUserAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testValue = Random.nextFloat()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { setCustomUserAttribute(testKey, testValue) } doReturn expectedResult
        }
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setDoubleCustomUserAttribute(testKey, testValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setCustomUserAttribute(testKey, testValue)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenSetDateCustomUserAttributeIsCalled_setCustomUserAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testValue = nowInSeconds().toInt()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on {
                setCustomUserAttributeToSecondsFromEpoch(
                    testKey,
                    testValue.toLong()
                )
            } doReturn expectedResult
        }
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setDateCustomUserAttribute(testKey, testValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setCustomUserAttributeToSecondsFromEpoch(testKey, testValue.toLong())

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenIncrementCustomUserAttributeIsCalled_incrementCustomUserAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testIncrementValue = Random.nextInt()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { incrementCustomUserAttribute(testKey, testIncrementValue) } doReturn expectedResult
        }
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.incrementCustomUserAttribute(testKey, testIncrementValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).incrementCustomUserAttribute(testKey, testIncrementValue)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenUnsetCustomUserAttributeIsCalled_unsetCustomUserAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { unsetCustomUserAttribute(testKey) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.unsetCustomUserAttribute(testKey, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).unsetCustomUserAttribute(testKey)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    @Suppress("MaxLineLength")
    fun whenSetCustomUserAttributeObjectArrayIsCalled_setCustomUserAttributeGetsCalledWithJSONArrayAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val expectedResult = true

        val testReadableArray = mock<ReadableArray> {
            on { size() } doReturn 0
            on { toArrayList() } doReturn arrayListOf()
        }

        val brazeUserMock = mock<BrazeUser> {
            on { setCustomUserAttribute(eq(testKey), any<JSONArray>()) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setCustomUserAttributeObjectArray(testKey, testReadableArray, callback)
        blockUntil { callbackInvoked }

        val captor = argumentCaptor<JSONArray>()
        verify(brazeUserMock).setCustomUserAttribute(eq(testKey), captor.capture())

        val capturedArray = captor.firstValue
        assertEquals(0, capturedArray.length())

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    @Suppress("MaxLineLength")
    fun whenSetCustomUserAttributeArrayIsCalled_setCustomAttributeArrayGetsCalledWithStringArrayAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val expectedResult = true
        val testStringArray = arrayOf("value1", "value2", "value3")

        val testReadableArray = mock<ReadableArray> {
            on { size() } doReturn testStringArray.size
            on { getString(0) } doReturn testStringArray[0]
            on { getString(1) } doReturn testStringArray[1]
            on { getString(2) } doReturn testStringArray[2]
        }

        val brazeUserMock = mock<BrazeUser> {
            on {
                setCustomAttributeArray(
                    eq(testKey),
                    any<Array<String?>>()
                )
            } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setCustomUserAttributeArray(testKey, testReadableArray, callback)
        blockUntil { callbackInvoked }

        val captor = argumentCaptor<Array<String?>>()
        verify(brazeUserMock).setCustomAttributeArray(eq(testKey), captor.capture())

        val capturedArray = captor.firstValue
        assertEquals(3, capturedArray.size)
        assertEquals("value1", capturedArray[0])
        assertEquals("value2", capturedArray[1])
        assertEquals("value3", capturedArray[2])

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenSetCustomUserAttributeObjectIsCalled_setCustomAttributeGetsCalledWithJSONObjectAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testMerge = true
        val expectedResult = true

        val mockKeySetIterator = mock<ReadableMapKeySetIterator> {
            on { hasNextKey() } doReturn false
        }

        val testReadableMap = mock<ReadableMap> {
            on { toHashMap() } doReturn hashMapOf(
                "name" to "John",
                "age" to 30,
                "active_user" to true
            )
            on { keySetIterator() } doReturn mockKeySetIterator
        }

        val brazeUserMock = mock<BrazeUser> {
            on {
                setCustomAttribute(
                    eq(testKey),
                    any<JSONObject>(),
                    eq(testMerge)
                )
            } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setCustomUserAttributeObject(
            testKey,
            testReadableMap,
            testMerge,
            callback
        )
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setCustomAttribute(eq(testKey), any<JSONObject>(), eq(testMerge))

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenAddToCustomAttributeArrayIsCalled_addToCustomAttributeArrayGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testValue = Random.nextInt().toString()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { addToCustomAttributeArray(testKey, testValue) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.addToCustomAttributeArray(testKey, testValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).addToCustomAttributeArray(testKey, testValue)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenRemoveFromCustomAttributeArrayIsCalled_removeFromCustomAttributeArrayGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testValue = Random.nextInt().toString()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { removeFromCustomAttributeArray(testKey, testValue) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.removeFromCustomAttributeArray(testKey, testValue, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).removeFromCustomAttributeArray(testKey, testValue)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenBridgeSetFirstNameIsCalled_brazeSetFirstNameGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val firstName = Random.nextInt().toString()
        brazeReactBridgeImpl.setFirstName(firstName)
        verify(brazeUserMock).setFirstName(firstName)
    }

    @Test
    fun whenBridgeSetLastNameIsCalled_brazeSetLastNameGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val lastName = Random.nextInt().toString()
        brazeReactBridgeImpl.setLastName(lastName)
        verify(brazeUserMock).setLastName(lastName)
    }

    @Test
    fun whenBridgeSetEmailIsCalled_brazeSetEmailGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val email = "${Random.nextInt()}@gmail.com"
        brazeReactBridgeImpl.setEmail(email)
        verify(brazeUserMock).setEmail(email)
    }

    @Test
    fun whenSetGenderIsCalled_setGenderGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testGender = "m"
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { setGender(Gender.MALE) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setGender(testGender, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setGender(Gender.MALE)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenSetDateOfBirthIsCalled_setDateOfBirthGetsCalled() {
        val testYear = 1994
        val testMonth = 9
        val testDay = 15

        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        brazeReactBridgeImpl.setDateOfBirth(testYear, testMonth, testDay)

        verify(brazeUserMock).setDateOfBirth(testYear, Month.SEPTEMBER, testDay)
    }

    @Test
    fun whenBridgeSetCountryIsCalled_brazeSetCountryGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val country = Random.nextInt().toString()
        brazeReactBridgeImpl.setCountry(country)
        verify(brazeUserMock).setCountry(country)
    }

    @Test
    fun whenBridgeSetHomeCityIsCalled_brazeSetHomeCityGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val homeCity = Random.nextInt().toString()
        brazeReactBridgeImpl.setHomeCity(homeCity)
        verify(brazeUserMock).setHomeCity(homeCity)
    }

    @Test
    fun whenBridgeSetPhoneNumberIsCalled_brazeSetPhoneNumberGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val phoneNumber = Random.nextLong(1000000000L, 10000000000L).toString()
        brazeReactBridgeImpl.setPhoneNumber(phoneNumber)
        verify(brazeUserMock).setPhoneNumber(phoneNumber)
    }

    @Test
    fun whenBridgeSetLanguageIsCalled_brazeSetLanguageGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val language = "EN-us"
        brazeReactBridgeImpl.setLanguage(language)
        verify(brazeUserMock).setLanguage(language)
    }

    @Test
    fun whenAddToSubscriptionGroupIsCalled_addToSubscriptionGroupGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testGroupId = Random.nextInt().toString()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { addToSubscriptionGroup(testGroupId) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.addToSubscriptionGroup(testGroupId, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).addToSubscriptionGroup(testGroupId)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenRemoveFromSubscriptionGroupIsCalled_removeFromSubscriptionGroupGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testGroupId = Random.nextInt().toString()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { removeFromSubscriptionGroup(testGroupId) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.removeFromSubscriptionGroup(testGroupId, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).removeFromSubscriptionGroup(testGroupId)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    @Suppress("MaxLineLength")
    fun whenSetPushNotificationSubscriptionTypeIsCalledWithValidType_setPushNotificationSubscriptionTypeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testSubscriptionType = "subscribed"
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { setPushNotificationSubscriptionType(NotificationSubscriptionType.SUBSCRIBED) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setPushNotificationSubscriptionType(testSubscriptionType, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setPushNotificationSubscriptionType(NotificationSubscriptionType.SUBSCRIBED)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    @Suppress("MaxLineLength")
    fun whenSetEmailNotificationSubscriptionTypeIsCalledWithValidType_setEmailNotificationSubscriptionTypeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testSubscriptionType = "unsubscribed"
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser> {
            on { setEmailNotificationSubscriptionType(NotificationSubscriptionType.UNSUBSCRIBED) } doReturn expectedResult
        }
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setEmailNotificationSubscriptionType(testSubscriptionType, callback)
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setEmailNotificationSubscriptionType(NotificationSubscriptionType.UNSUBSCRIBED)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    @Ignore("Ignore until SDK-6251")
    fun whenGetBannerIsCalledWithValidPlacementId_promiseResolvesWithBannerData() {
        val testPlacementId = Random.nextInt().toString()
        val isTestSend = getRandomBoolean()
        val isControl = getRandomBoolean()
        val banner = createBanner(
            trackingId = "track123",
            placementId = testPlacementId,
            html = "<div>Banner</div>",
            isTestSend = isTestSend,
            expirationTimestampSeconds = 1234567890L,
            isControl = isControl,
            properties = JSONObject(mapOf("key" to "value"))
        )

        val brazeMock = mock<Braze> {
            on { getBanner(testPlacementId) } doReturn banner
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val mockPromise = mock<Promise>()
        brazeReactBridgeImpl.getBanner(testPlacementId, mockPromise)

        verify(brazeMock).getBanner(testPlacementId)

        val captor = argumentCaptor<WritableMap>()
        verify(mockPromise).resolve(captor.capture())

        val result = captor.firstValue
        assertEquals("track123", result.getString("trackingId"))
        assertEquals(testPlacementId, result.getString("placementId"))
        assertEquals(isTestSend, result.getBoolean("isTestSend"))
        assertEquals(isControl, result.getBoolean("isControl"))
        assertEquals("<div>Banner</div>", result.getString("html"))
        assertEquals(1234567890.0, result.getDouble("expiresAt"), 0.001)

        val properties = result.getMap("properties")
        ktAssertNotNull(properties)
        assertEquals("value", properties.getString("key"))
    }

    @Test
    fun whenBridgeRequestBannersRefreshIsCalled_brazeRequestBannersRefreshGetsCalledWithConvertedPlacementIds() {
        val testPlacementIds = mock<ReadableArray> {
            on { toArrayList() } doReturn arrayListOf(
                "placement-1",
                "placement-2",
                "placement-3"
            )
        }

        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        brazeReactBridgeImpl.requestBannersRefresh(testPlacementIds)

        verify(brazeMock).requestBannersRefresh(
            listOf("placement-1", "placement-2", "placement-3")
        )
    }

    @Test
    fun whenBridgeLaunchContentCardsIsCalled_contentCardsActivityIsStarted() {
        val mockActivity = mock<Activity>()
        val mockReactContext = mock<TestReactApplicationContext>()
        val bridgeWithMockActivity = BrazeReactBridgeImpl(mockReactContext, mockActivity)
        val dismissAutomatically = true

        bridgeWithMockActivity.launchContentCards(dismissAutomatically)
        verify(mockReactContext).startActivity(any())
    }

    @Test
    fun whenBridgeRequestContentCardsRefreshIsCalled_brazeRequestContentCardsRefreshGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.requestContentCardsRefresh()
        verify(brazeMock).requestContentCardsRefresh()
    }

    @Test
    fun whenGetContentCardsIsCalled_brazeSubscribeToContentCardsUpdatesAndRequestRefreshAreCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getContentCards(mockPromise)

        verify(brazeMock).subscribeToContentCardsUpdates(any())
        verify(brazeMock).requestContentCardsRefresh()
    }

    @Test
    fun whenGetCachedContentCardsIsCalled_promiseResolvesWithCachedCards() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val cachedPromise = mock<Promise>()
        brazeReactBridgeImpl.getCachedContentCards(cachedPromise)

        verify(cachedPromise).resolve(any<WritableArray>())
    }

    @Test
    fun whenBridgeSetSdkAuthSignatureIsCalled_brazeSetSdkAuthSignatureGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val signature = Random.nextInt().toString()
        brazeReactBridgeImpl.setSdkAuthenticationSignature(signature)
        verify(brazeMock).setSdkAuthenticationSignature(signature)
    }

    @Test
    fun testGetPushEventType_returnsCorrectType() {
        assertEquals(
            "push_received",
            brazeReactBridgeImpl.getPushEventType(BrazePushEventType.NOTIFICATION_RECEIVED)
        )
        assertEquals(
            "push_opened",
            brazeReactBridgeImpl.getPushEventType(BrazePushEventType.NOTIFICATION_OPENED)
        )
    }

    @Test
    fun whenLogContentCardDismissedIsCalledWithValidId_cardIsDismissedPropertyIsSetToTrue() {
        val testCardId = Random.nextInt().toString()

        val mockCard = mock<Card> {
            on { id } doReturn testCardId
        }

        // Use reflection to directly populate the contentCards list without triggering React Native mapping
        // which doesn't work in tests
        val contentCardsField = BrazeReactBridgeImpl::class.java.getDeclaredField("contentCards")
        contentCardsField.isAccessible = true
        val contentCardsList = contentCardsField.get(brazeReactBridgeImpl) as MutableList<Card>
        contentCardsList.clear()
        contentCardsList.add(mockCard)

        brazeReactBridgeImpl.logContentCardDismissed(testCardId)
        verify(mockCard).isDismissed = true
    }

    @Test
    fun whenLogContentCardClickedIsCalledWithValidId_cardLogClickIsCalled() {
        val testCardId = Random.nextInt().toString()

        val mockCard = mock<Card> {
            on { id } doReturn testCardId
        }

        // Use reflection to directly populate the contentCards list without triggering React Native mapping
        // which doesn't work in tests
        val contentCardsField = BrazeReactBridgeImpl::class.java.getDeclaredField("contentCards")
        contentCardsField.isAccessible = true
        val contentCardsList = contentCardsField.get(brazeReactBridgeImpl) as MutableList<Card>
        contentCardsList.clear()
        contentCardsList.add(mockCard)

        brazeReactBridgeImpl.logContentCardClicked(testCardId)
        verify(mockCard).logClick()
    }

    @Test
    fun whenLogContentCardImpressionIsCalledWithValidId_cardLogImpressionIsCalled() {
        val testCardId = Random.nextInt().toString()

        val mockCard = mock<Card> {
            on { id } doReturn testCardId
        }

        // Use reflection to directly populate the contentCards list without triggering React Native mapping
        // which doesn't work in tests
        val contentCardsField = BrazeReactBridgeImpl::class.java.getDeclaredField("contentCards")
        contentCardsField.isAccessible = true
        val contentCardsList = contentCardsField.get(brazeReactBridgeImpl) as MutableList<Card>
        contentCardsList.clear()
        contentCardsList.add(mockCard)

        brazeReactBridgeImpl.logContentCardImpression(testCardId)
        verify(mockCard).logImpression()
    }

    @Test
    fun whenBridgeRequestLocationInitializationIsCalled_brazeRequestLocationInitializationGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.requestLocationInitialization()
        verify(brazeMock).requestLocationInitialization()
    }

    @Test
    fun whenBridgeRequestGeofencesIsCalled_brazeRequestGeofencesGetsCalled() {
        val latitude = Random.nextDouble()
        val longitude = Random.nextDouble()
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.requestGeofences(latitude, longitude)
        verify(brazeMock).requestGeofences(latitude, longitude)
    }

    @Test
    fun whenSetLocationCustomUserAttributeIsCalled_setLocationCustomAttributeGetsCalledAndCallbackReceivesResult() {
        var callbackResult: Boolean? = null
        var callbackInvoked = false

        val testKey = Random.nextInt().toString()
        val testLatitude = Random.nextDouble()
        val testLongitude = Random.nextDouble()
        val expectedResult = true

        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        val callback = createTestCallback<Boolean, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.setLocationCustomAttribute(
            testKey,
            testLatitude,
            testLongitude,
            callback
        )
        blockUntil { callbackInvoked }

        verify(brazeUserMock).setLocationCustomAttribute(testKey, testLatitude, testLongitude)

        assertTrue(callbackInvoked)
        assertEquals(expectedResult, callbackResult)
    }

    @Test
    fun whenBridgeSetLastKnownLocationIsCalledWithValidData_brazeSetLastKnownLocationGetsCalled() {
        val testLatitude = Random.nextDouble()
        val testLongitude = Random.nextDouble()
        val testAltitude = Random.nextDouble()
        val testHorizontalAccuracy = Random.nextDouble()
        val testVerticalAccuracy = Random.nextDouble()

        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        brazeReactBridgeImpl.setLastKnownLocation(
            testLatitude,
            testLongitude,
            testAltitude,
            testHorizontalAccuracy,
            testVerticalAccuracy
        )

        verify(brazeUserMock).setLastKnownLocation(
            testLatitude,
            testLongitude,
            testAltitude,
            testHorizontalAccuracy,
            testVerticalAccuracy
        )
    }

    @Test
    fun whenBridgeLogInAppMessageClickedIsCalled_logClickIsCalledOnMessage() {
        val testInAppMessageString = """{"message":"${Random.nextInt()}"}"""
        val mockInAppMessage = mock<IInAppMessage>()

        val brazeMock = mock<Braze> {
            on { deserializeInAppMessageString(testInAppMessageString) } doReturn mockInAppMessage
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        brazeReactBridgeImpl.logInAppMessageClicked(testInAppMessageString)

        verify(brazeMock).deserializeInAppMessageString(testInAppMessageString)
        verify(mockInAppMessage).logClick()
    }

    @Test
    fun whenBridgeLogInAppMessageImpressionIsCalled_logImpressionIsCalledOnMessage() {
        val testInAppMessageString = """{"message":"${Random.nextInt()}"}"""
        val mockInAppMessage = mock<IInAppMessage>()

        val brazeMock = mock<Braze> {
            on { deserializeInAppMessageString(testInAppMessageString) } doReturn mockInAppMessage
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        brazeReactBridgeImpl.logInAppMessageImpression(testInAppMessageString)

        verify(brazeMock).deserializeInAppMessageString(testInAppMessageString)
        verify(mockInAppMessage).logImpression()
    }

    @Test
    fun whenLogInAppMessageButtonClickedIsCalledWithValidImmersiveMessage_logButtonClickIsCalled() {
        val testInAppMessageString = """{"message":"${Random.nextInt()}"}"""
        val testButtonId = Random.nextInt(1, 2)

        val mockButton = mock<MessageButton> {
            on { id } doReturn testButtonId
        }
        val mockImmersiveMessage = mock<InAppMessageImmersiveBase> {
            on { messageButtons } doReturn listOf(mockButton)
        }
        val brazeMock = mock<Braze> {
            on { deserializeInAppMessageString(testInAppMessageString) } doReturn mockImmersiveMessage
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        brazeReactBridgeImpl.logInAppMessageButtonClicked(testInAppMessageString, testButtonId)

        verify(brazeMock).deserializeInAppMessageString(testInAppMessageString)
        verify(mockImmersiveMessage).logButtonClick(mockButton)
    }

    @Test
    fun whenSetAttributionDataIsCalledWithValidData_attributionDataIsSetOnUser() {
        val testNetwork = getRandomString()
        val testCampaign = getRandomString()
        val testAdGroup = getRandomString()
        val testCreative = getRandomString()

        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = getBrazeMock(brazeUserMock)
        brazeReactBridgeImpl.brazeTestingMock = brazeMock

        brazeReactBridgeImpl.setAttributionData(
            testNetwork,
            testCampaign,
            testAdGroup,
            testCreative
        )

        val captor = argumentCaptor<AttributionData>()
        verify(brazeUserMock).setAttributionData(captor.capture())

        val capturedData = captor.firstValue

        // Use reflection to access private fields
        assertEquals(testNetwork, getPrivateField(capturedData, "network"))
        assertEquals(testCampaign, getPrivateField(capturedData, "campaign"))
        assertEquals(testAdGroup, getPrivateField(capturedData, "adGroup"))
        assertEquals(testCreative, getPrivateField(capturedData, "creative"))
    }

    @Test
    fun whenBridgeGetDeviceIdIsCalled_callbackReceivesDeviceId() {
        var callbackResult: String? = null
        var callbackInvoked = false

        val callback = createTestCallback<String, Unit>(
            onSuccess = { arg ->
                callbackResult = arg
            },
            onFail = { fail("Callback did not return any data.") },
            onCompletion = {
                callbackInvoked = true
            }
        )

        brazeReactBridgeImpl.getDeviceId(callback)
        blockUntil { callbackInvoked }

        assertTrue(callbackInvoked)
        val result = callbackResult
        ktAssertNotNull(result)
        // We can't test the actual device ID because it can't be set manually so we just
        // test that it's not blank
        assertTrue(result.isNotBlank())
    }

    @Test
    fun whenBridgeGetDeviceIdIsCalledWithDisabledSDK_callbackReceivesDeviceId() {
        var callbackErrorMessage: String? = null
        var callbackInvoked = false

        val callback = createTestCallback<Unit, String>(
            onCompletion = { callbackInvoked = true },
            onSuccess = { _ -> fail("Should not have any success result with disabled SDK") },
            onFail = { e -> callbackErrorMessage = e },
        )

        brazeReactBridgeImpl.disableSDK()
        brazeReactBridgeImpl.getDeviceId(callback)
        blockUntil { callbackInvoked }

        assertTrue(callbackInvoked)
        assertEquals("Failed to retrieve the current device id.", callbackErrorMessage)
    }

    @Test
    fun whenGetAllFeatureFlagsIsCalled_promiseResolvesWithConvertedFeatureFlags() {
        val mockFlag1 = createFeatureFlag(
            id = "flag1",
            enabled = true,
            propertiesJson = JSONObject().toString(),
        )
        val mockFlag2 = createFeatureFlag(
            id = "flag2",
            enabled = false,
            propertiesJson = JSONObject().toString(),
        )
        val testFeatureFlags = listOf(mockFlag1, mockFlag2)

        val brazeMock = mock<Braze> {
            on { getAllFeatureFlags() } doReturn testFeatureFlags
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getAllFeatureFlags(mockPromise)

        verify(brazeMock).getAllFeatureFlags()

        val captor = argumentCaptor<WritableArray>()
        verify(mockPromise).resolve(captor.capture())

        val result = captor.firstValue
        assertEquals(2, result.size())

        // Verify first feature flag
        val flag1Map = result.getMap(0)
        ktAssertNotNull(flag1Map)
        assertEquals("flag1", flag1Map.getString("id"))
        assertTrue(flag1Map.getBoolean("enabled"))

        // Verify second feature flag
        val flag2Map = result.getMap(1)
        ktAssertNotNull(flag2Map)
        assertEquals("flag2", flag2Map.getString("id"))
        assertFalse(flag2Map.getBoolean("enabled"))
    }

    @Test
    fun whenGetFeatureFlagIsCalledWithValidId_promiseResolvesWithConvertedFeatureFlag() {
        val testFlagId = "test_flag_id"
        val mockFlag = createFeatureFlag(
            id = testFlagId,
            enabled = true,
            propertiesJson = JSONObject().toString()
        )

        val brazeMock = mock<Braze> {
            on { getFeatureFlag(testFlagId) } doReturn mockFlag
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getFeatureFlag(testFlagId, mockPromise)

        verify(brazeMock).getFeatureFlag(testFlagId)

        val captor = argumentCaptor<WritableMap>()
        verify(mockPromise).resolve(captor.capture())

        val result = captor.firstValue
        assertEquals(testFlagId, result.getString("id"))
        assertTrue(result.getBoolean("enabled"))

        val properties = result.getMap("properties")
        ktAssertNotNull(properties)
    }

    @Test
    fun whenBridgeRefreshFeatureFlagsIsCalled_brazeRefreshFeatureFlagsGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.refreshFeatureFlags()
        verify(brazeMock).refreshFeatureFlags()
    }

    @Test
    fun whenBridgeLogFeatureFlagImpressionIsCalled_brazeLogFeatureFlagImpressionGetsCalled() {
        val id = Random.nextInt().toString()
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.logFeatureFlagImpression(id)
        verify(brazeMock).logFeatureFlagImpression(id)
    }

    @Test
    fun whenGetFeatureFlagBooleanPropertyIsCalled_brazeGetFeatureFlagAndGetBooleanPropertyGetsCalled() {
        val testFlagId = "test_flag"
        val testPropertyKey = "test_key"
        val expectedValue = Random.nextBoolean()

        val mockFeatureFlag = mock<FeatureFlag> {
            on { getBooleanProperty(testPropertyKey) } doReturn expectedValue
        }

        val brazeMock = mock<Braze> {
            on { getFeatureFlag(testFlagId) } doReturn mockFeatureFlag
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getFeatureFlagBooleanProperty(testFlagId, testPropertyKey, mockPromise)

        verify(brazeMock).getFeatureFlag(testFlagId)
        verify(mockFeatureFlag).getBooleanProperty(testPropertyKey)
        verify(mockPromise).resolve(expectedValue)
    }

    @Test
    fun whenGetFeatureFlagStringPropertyIsCalled_brazeGetFeatureFlagAndGetStringPropertyGetsCalled() {
        val testFlagId = "test_flag"
        val testPropertyKey = "test_key"
        val expectedValue = Random.nextInt().toString()

        val mockFeatureFlag = mock<FeatureFlag> {
            on { getStringProperty(testPropertyKey) } doReturn expectedValue
        }

        val brazeMock = mock<Braze> {
            on { getFeatureFlag(testFlagId) } doReturn mockFeatureFlag
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getFeatureFlagStringProperty(testFlagId, testPropertyKey, mockPromise)

        verify(brazeMock).getFeatureFlag(testFlagId)
        verify(mockFeatureFlag).getStringProperty(testPropertyKey)
        verify(mockPromise).resolve(expectedValue)
    }

    @Test
    fun whenGetFeatureFlagNumberPropertyIsCalled_brazeGetFeatureFlagAndGetNumberPropertyGetsCalled() {
        val testFlagId = "test_flag"
        val testPropertyKey = "test_key"
        val expectedValue = Random.nextInt()

        val mockFeatureFlag = mock<FeatureFlag> {
            on { getNumberProperty(testPropertyKey) } doReturn expectedValue
        }

        val brazeMock = mock<Braze> {
            on { getFeatureFlag(testFlagId) } doReturn mockFeatureFlag
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getFeatureFlagNumberProperty(testFlagId, testPropertyKey, mockPromise)

        verify(brazeMock).getFeatureFlag(testFlagId)
        verify(mockFeatureFlag).getNumberProperty(testPropertyKey)
        verify(mockPromise).resolve(expectedValue)
    }

    @Test
    fun whenGetFeatureFlagTimestampPropertyIsCalled_brazeGetFeatureFlagAndGetTimestampPropertyGetsCalled() {
        val testFlagId = "test_flag"
        val testPropertyKey = "test_key"
        val expectedValue = System.currentTimeMillis() / 1000
        val expectedPromiseValue = expectedValue.toDouble()

        val mockFeatureFlag = mock<FeatureFlag> {
            on { getTimestampProperty(testPropertyKey) } doReturn expectedValue
        }

        val brazeMock = mock<Braze> {
            on { getFeatureFlag(testFlagId) } doReturn mockFeatureFlag
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getFeatureFlagTimestampProperty(
            testFlagId,
            testPropertyKey,
            mockPromise
        )

        verify(brazeMock).getFeatureFlag(testFlagId)
        verify(mockFeatureFlag).getTimestampProperty(testPropertyKey)
        verify(mockPromise).resolve(expectedPromiseValue)
    }

    @Test
    fun whenGetFeatureFlagImagePropertyIsCalled_brazeGetFeatureFlagAndGetImagePropertyGetsCalled() {
        val testFlagId = "test_flag"
        val testPropertyKey = "test_key"
        val expectedValue = Random.nextInt().toString()

        val mockFeatureFlag = mock<FeatureFlag> {
            on { getImageProperty(testPropertyKey) } doReturn expectedValue
        }

        val brazeMock = mock<Braze> {
            on { getFeatureFlag(testFlagId) } doReturn mockFeatureFlag
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val mockPromise = mock<Promise>()

        brazeReactBridgeImpl.getFeatureFlagImageProperty(testFlagId, testPropertyKey, mockPromise)

        verify(brazeMock).getFeatureFlag(testFlagId)
        verify(mockFeatureFlag).getImageProperty(testPropertyKey)
        verify(mockPromise).resolve(expectedValue)
    }

    @Test
    fun whenGetFeatureFlagJSONPropertyIsCalled_brazeGetFeatureFlagAndGetJSONPropertyGetsCalled() {
        val testFlagId = "test_flag"
        val testPropertyKey = "test_key"
        val expectedValue = JSONObject()

        val mockFeatureFlag = mock<FeatureFlag> {
            on { getJSONProperty(testPropertyKey) } doReturn expectedValue
        }

        val brazeMock = mock<Braze> {
            on { getFeatureFlag(testFlagId) } doReturn mockFeatureFlag
        }

        val brazeReactBridgeImplMock = mock<BrazeReactBridgeImpl> {
            on { getFeatureFlagJSONProperty(eq(testFlagId), eq(testPropertyKey), any()) } doAnswer { invocation ->
                val featureFlag = brazeMock.getFeatureFlag(testFlagId)
                val jsonProperty = featureFlag?.getJSONProperty(testPropertyKey)
                val promise = invocation.getArgument<Promise>(2)
                promise.resolve(jsonProperty)
            }
        }

        val mockPromise = mock<Promise>()

        brazeReactBridgeImplMock.getFeatureFlagJSONProperty(testFlagId, testPropertyKey, mockPromise)

        verify(brazeReactBridgeImplMock).getFeatureFlagJSONProperty(testFlagId, testPropertyKey, mockPromise)
        verify(brazeMock).getFeatureFlag(testFlagId)
        verify(mockFeatureFlag).getJSONProperty(testPropertyKey)
        verify(mockPromise).resolve(expectedValue)
    }

    @Test
    fun whenBridgeSetAdTrackingEnabledIsCalled_brazeSetGoogleAdvertisingIdGetsCalled() {
        val adTrackingEnabled = Random.nextBoolean()
        val googleAdId = Random.nextInt().toString()
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.setAdTrackingEnabled(adTrackingEnabled, googleAdId)
        verify(brazeMock).setGoogleAdvertisingId(googleAdId, adTrackingEnabled)
    }

    @Test
    fun whenBridgeSetAdTrackingEnabledIsCalledWithNullGoogleAdId_brazeMethodGetsCalledWithExpectedParameter() {
        val adTrackingEnabled = Random.nextBoolean()
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.setAdTrackingEnabled(adTrackingEnabled, null)
        verify(brazeMock).setGoogleAdvertisingId("", adTrackingEnabled)
    }

    /**
     * Creates a test [Callback] for React Native bridging that handles success, failure, and completion.
     *
     * Calls [onCompletion] every time it's invoked.
     * - If two or more arguments are received, treats the second as the result and calls [onSuccess].
     * - If one argument is received, treats it as an error and calls [onFail].
     *
     * @param onSuccess Invoked with the result value.
     * @param onFail Invoked with the error value.
     * @param onCompletion Invoked on every callback.
     * @return A [Callback] instance for testing.
     *
     * @param T The type of the success result.
     * @param E The type of the error.
     */
    private fun <T, E> createTestCallback(
        onSuccess: (T?) -> Unit,
        onFail: (E?) -> Unit,
        onCompletion: () -> Unit
    ): Callback {
        return Callback { args ->
            onCompletion()
            if (args.size >= 2) {
                // First argument in the RN Callback is always an error (null means no error)
                // Second argument is the result that we actually want to read
                @Suppress("UNCHECKED_CAST")
                onSuccess(args[1] as T?)
            } else if (args.size == 1) {
                @Suppress("UNCHECKED_CAST")
                onFail(args[0] as E?)
            }
        }
    }

    private fun getBrazeMock(brazeUserMock: BrazeUser): Braze {
        return mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
    }
}
