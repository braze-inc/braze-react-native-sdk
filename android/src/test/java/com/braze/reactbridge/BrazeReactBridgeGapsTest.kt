package com.braze.reactbridge

import android.app.Activity
import android.content.Intent
import com.braze.Braze
import com.braze.Constants
import com.braze.events.ContentCardsUpdatedEvent
import com.braze.events.IFireOnceEventSubscriber
import com.braze.configuration.BrazeConfig
import com.braze.enums.NotificationSubscriptionType
import com.braze.models.cards.Card
import com.braze.ui.inappmessage.BrazeInAppMessageManager
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.robolectric.Robolectric
import kotlin.random.Random

/**
 * Bridge method coverage for [BrazeReactBridgeImpl] paths not exercised elsewhere.
 */
class BrazeReactBridgeGapsTest : BrazeRobolectricTestBase() {
    private lateinit var reactContext: TestReactApplicationContext
    private lateinit var bridge: BrazeReactBridgeImpl

    @Before
    fun setUp() {
        reactContext = TestReactApplicationContext()
        val brazeConfig = BrazeConfig.Builder()
            .setApiKey("test-api-key")
            .build()
        Braze.configure(reactContext, brazeConfig)
        bridge = BrazeReactBridgeImpl(reactContext, Robolectric.buildActivity(Activity::class.java).get())
    }

    @After
    fun tearDown() {
        BrazeReactUtils.clearInitialPushPayload()
    }

    @Test
    fun whenGetInitialPushPayload_withStoredPayload_callbackReceivesPayloadAndClearsState() {
        val intent = Intent().apply {
            putExtra(Constants.BRAZE_PUSH_BRAZE_KEY, "true")
            putExtra(Constants.BRAZE_PUSH_TITLE_KEY, "Cold start")
        }
        BrazeReactUtils.populateInitialPushPayloadFromIntent(intent)

        var callbackResult: com.facebook.react.bridge.WritableMap? = null
        var callbackInvoked = false
        val callback = Callback { args ->
            callbackInvoked = true
            if (args.size >= 2) {
                @Suppress("UNCHECKED_CAST")
                callbackResult = args[1] as com.facebook.react.bridge.WritableMap?
            }
        }

        bridge.getInitialPushPayload(callback)
        blockUntil { callbackInvoked }

        assertNotNull(callbackResult)
        assertEquals("Cold start", callbackResult?.getString("title"))
        assertNull(BrazeReactUtils.getInitialPushPayload())
    }

    @Test
    fun whenGetInitialPushPayload_withoutPayload_callbackReceivesNull() {
        var callbackResult: com.facebook.react.bridge.WritableMap? = null
        var callbackInvoked = false
        val callback = Callback { args ->
            callbackInvoked = true
            if (args.size >= 2) {
                @Suppress("UNCHECKED_CAST")
                callbackResult = args[1] as com.facebook.react.bridge.WritableMap?
            }
        }

        bridge.getInitialPushPayload(callback)
        blockUntil { callbackInvoked }

        assertNull(callbackResult)
    }

    @Test
    fun whenGetUserId_withBlankUserId_callbackReceivesError() {
        val brazeUserMock = mock<com.braze.BrazeUser> {
            on { userId } doReturn ""
        }
        val brazeMock = mock<Braze> {
            on { getCurrentUser(any()) }.thenAnswer { invocation ->
                (invocation.arguments[0] as com.braze.events.IValueCallback<com.braze.BrazeUser>)
                    .onSuccess(brazeUserMock)
            }
        }
        bridge.brazeTestingMock = brazeMock

        var errorMessage: String? = null
        var callbackInvoked = false
        val callback = Callback { args ->
            callbackInvoked = true
            if (args.size == 1) {
                errorMessage = args[0] as String?
            }
        }

        bridge.getUserId(callback)
        blockUntil { callbackInvoked }

        assertEquals("User ID not found.", errorMessage)
    }

    @Test
    fun whenSetPushNotificationSubscriptionType_withInvalidType_doesNotCallBrazeUser() {
        val brazeUserMock = mock<com.braze.BrazeUser>()
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.thenAnswer { invocation ->
                (invocation.arguments[0] as com.braze.events.IValueCallback<com.braze.BrazeUser>)
                    .onSuccess(brazeUserMock)
            }
        }
        bridge.brazeTestingMock = brazeMock

        bridge.setPushNotificationSubscriptionType("invalid_type", null)
        verify(brazeUserMock, never()).setPushNotificationSubscriptionType(any())
    }

    @Test
    fun whenSetEmailNotificationSubscriptionType_withInvalidType_doesNotCallBrazeUser() {
        val brazeUserMock = mock<com.braze.BrazeUser>()
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.thenAnswer { invocation ->
                (invocation.arguments[0] as com.braze.events.IValueCallback<com.braze.BrazeUser>)
                    .onSuccess(brazeUserMock)
            }
        }
        bridge.brazeTestingMock = brazeMock

        bridge.setEmailNotificationSubscriptionType("invalid_type", null)
        verify(brazeUserMock, never()).setEmailNotificationSubscriptionType(any())
    }

    @Test
    fun whenSetPushNotificationSubscriptionType_withValidType_callsBrazeUser() {
        val brazeUserMock = mock<com.braze.BrazeUser>()
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.thenAnswer { invocation ->
                (invocation.arguments[0] as com.braze.events.IValueCallback<com.braze.BrazeUser>)
                    .onSuccess(brazeUserMock)
            }
        }
        bridge.brazeTestingMock = brazeMock

        bridge.setPushNotificationSubscriptionType("optedin", null)
        verify(brazeUserMock).setPushNotificationSubscriptionType(NotificationSubscriptionType.OPTED_IN)
    }

    @Test
    fun whenWipeDataIsCalled_doesNotThrow() {
        bridge.wipeData()
    }

    @Test
    fun whenEnableSdkIsCalled_sdkIsReEnabledAfterDisable() {
        bridge.disableSDK()
        assertTrue(Braze.isDisabled)

        bridge.enableSDK()
        assertFalse(Braze.isDisabled)
    }

    @Test
    fun whenHideCurrentInAppMessageIsCalled_doesNotThrow() {
        bridge.hideCurrentInAppMessage()
        assertNotNull(BrazeInAppMessageManager.getInstance())
    }

    @Test
    fun whenProcessContentCardClickAction_withMissingCard_doesNotThrow() {
        bridge.processContentCardClickAction("missing-card-id")
    }

    @Test
    fun whenProcessContentCardClickAction_withNullUrl_doesNotInvokeDeeplinkHandler() {
        val cardId = Random.nextInt().toString()
        val mockCard = mock<Card> {
            on { id } doReturn cardId
            on { url } doReturn null
            on { extras } doReturn emptyMap()
        }
        val contentCardsField = BrazeReactBridgeImpl::class.java.getDeclaredField("contentCards")
        contentCardsField.isAccessible = true
        val contentCardsList = contentCardsField.get(bridge) as MutableList<Card>
        contentCardsList.clear()
        contentCardsList.add(mockCard)

        bridge.processContentCardClickAction(cardId)
    }

    @Test
    fun whenGetContentCards_withoutActiveReactInstance_rejectsPromise() {
        val inactiveContext = EventCapturingReactApplicationContext(
            eventEmitter = mock(),
            activeReactInstance = false,
        )
        val inactiveBridge = BrazeReactBridgeImpl(inactiveContext, mock<Activity>())
        val brazeMock = mock<Braze>()
        inactiveBridge.brazeTestingMock = brazeMock
        val promise = mock<Promise>()

        inactiveBridge.getContentCards(promise)

        val subscriberCaptor = argumentCaptor<IFireOnceEventSubscriber<ContentCardsUpdatedEvent>>()
        verify(brazeMock).subscribeToContentCardsUpdates(subscriberCaptor.capture())
        subscriberCaptor.firstValue.trigger(
            ContentCardsUpdatedEvent(emptyList(), "user_1", 1_700_000_000L, false),
        )

        verify(promise).reject(
            eq(BrazeReactBridgeImpl.NO_ACTIVE_REACT_INSTANCE_PROMISE_CODE),
            eq("Cannot deliver getContentCards result because the React instance is not active."),
        )
    }

    @Test
    fun whenProcessContentCardClickAction_withValidUrl_completesWithoutError() {
        val cardId = Random.nextInt().toString()
        val mockCard = mock<Card> {
            on { id } doReturn cardId
            on { url } doReturn "https://example.com/card"
            on { openUriInWebView } doReturn true
            on { extras } doReturn mapOf("key" to "value")
        }
        val contentCardsField = BrazeReactBridgeImpl::class.java.getDeclaredField("contentCards")
        contentCardsField.isAccessible = true
        val contentCardsList = contentCardsField.get(bridge) as MutableList<Card>
        contentCardsList.clear()
        contentCardsList.add(mockCard)

        bridge.processContentCardClickAction(cardId)
    }

    @Test
    fun whenAddListener_forPushNotificationEvent_subscribesToPushEvents() {
        val brazeMock = mock<Braze>()
        bridge.brazeTestingMock = brazeMock

        bridge.addListener("pushNotificationEvent")

        verify(brazeMock).subscribeToPushNotificationEvents(any())
    }

    @Test
    fun whenRemoveListenersIsCalled_doesNotThrow() {
        bridge.removeListeners(1)
    }
}
