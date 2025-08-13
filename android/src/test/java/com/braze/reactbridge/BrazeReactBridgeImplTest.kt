package com.braze.reactbridge

import android.app.Activity
import androidx.test.core.app.ApplicationProvider
import com.braze.Braze
import com.braze.BrazeUser
import com.braze.events.IValueCallback
import com.facebook.react.bridge.ReactApplicationContext
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.kotlin.any
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.robolectric.RobolectricTestRunner
import kotlin.random.Random

@RunWith(RobolectricTestRunner::class)
class BrazeReactBridgeImplTest {
    private lateinit var brazeReactBridgeImpl: BrazeReactBridgeImpl

    @Before
    fun setup() {
        val mockReactAppContext = mock<ReactApplicationContext>()
        whenever(mockReactAppContext.applicationContext).thenReturn(ApplicationProvider.getApplicationContext())
        brazeReactBridgeImpl = BrazeReactBridgeImpl(mockReactAppContext, mock<Activity>())
    }

    @Test
    fun whenBridgeRequestLocationInitializationIsCalled_brazeRequestLocationInitializationGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.requestLocationInitialization()
        verify(brazeMock).requestLocationInitialization()
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
    fun whenBridgeSetFirstNameIsCalled_brazeSetFirstNameGetsCalled() {
        val brazeUserMock = mock<BrazeUser>()
        val brazeMock = mock<Braze> {
            on { currentUser } doReturn brazeUserMock
            on { getCurrentUser(any()) }.doAnswer { invocation ->
                (invocation.arguments[0] as IValueCallback<BrazeUser>).onSuccess(brazeUserMock)
            }
        }
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val firstName = Random.nextInt().toString()
        brazeReactBridgeImpl.setFirstName(firstName)
        verify(brazeUserMock).setFirstName(firstName)
    }

    @Test
    fun whenBridgeRequestContentCardsRefreshIsCalled_brazeRequestContentCardsRefreshGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        brazeReactBridgeImpl.requestContentCardsRefresh()
        verify(brazeMock).requestContentCardsRefresh()
    }

    @Test
    fun whenBridgeSetSdkAuthSignatureIsCalled_brazeSetSdkAuthSignatureGetsCalled() {
        val brazeMock = mock<Braze>()
        brazeReactBridgeImpl.brazeTestingMock = brazeMock
        val signature = Random.nextInt().toString()
        brazeReactBridgeImpl.setSdkAuthenticationSignature(signature)
        verify(brazeMock).setSdkAuthenticationSignature(signature)
    }
}
