import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import { Linking, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Braze from '@braze/react-native-sdk';
import { HomeScreen } from './screens/HomeScreen';
import { ContentCardsScreen } from './screens/ContentCardsScreen';
import { BannersScreen } from './screens/BannersScreen';
import { FeatureFlagsScreen } from './screens/FeatureFlagsScreen';
import { UserManagementScreen } from './screens/UserManagementScreen';
import { Colors } from './constants/colors';
import { defaultApiKey, defaultEndpoint } from './constants/brazeConfig';

export type RootStackParamList = {
  Home: undefined;
  ContentCards: undefined;
  Banners: undefined;
  FeatureFlags: undefined;
  UserManagement: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const BrazeProject = (): ReactElement => {
  const handleOpenUrl = (event: { url: string }) => {
    console.log('handleOpenUrl called on url ' + event.url);
    Alert.alert('Deep Link', event.url, [
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);
  };

  const handlePushPayload = (pushPayload: Braze.PushNotificationEvent) => {
    if (pushPayload) {
      console.log(
        `Received push notification payload:
          - type: ${pushPayload.payload_type}
          - title: ${pushPayload.title}
          - is_silent: ${pushPayload.is_silent}
          - url: ${pushPayload.url}`,
      );
      console.log(JSON.stringify(pushPayload, undefined, 2));
    }
  };

  useEffect(() => {
    Braze.initialize(defaultApiKey, defaultEndpoint);

    // Listen to the `url` event to handle incoming deep links
    const listener = Linking.addEventListener('url', handleOpenUrl);

    // No `url` event is triggered on application start, so this handles
    // the case where a deep link launches the application
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          handleOpenUrl({ url });
        }
      })
      .catch(err => console.error('Error getting initial URL', err));

    // Handles push notification payloads and deep links when an app is launched from terminated state via push click.
    // On Android, requires BrazeReactUtils.populateInitialPushPayloadFromIntent(intent) in MainActivity.onCreate().
    // For more detail, see `Braze.getInitialPushPayload`.
    Braze.getInitialPushPayload(pushPayload => {
      if (pushPayload) {
        handlePushPayload(pushPayload);
      }
    });

    const inAppMessageSubscription = Braze.subscribeToInAppMessage(
      true,
      (event: Braze.InAppMessageEvent) => {
        console.log(`In-app message received: ${JSON.stringify(event)}`);
      },
    );

    const inAppMessageListener = Braze.addListener(
      Braze.Events.IN_APP_MESSAGE_RECEIVED,
      (event: Braze.InAppMessageEvent) => {
        console.log(`In-app message received: ${JSON.stringify(event)}`);
      },
    );

    const contentCardsSubscription = Braze.addListener(
      Braze.Events.CONTENT_CARDS_UPDATED,
      (event: Braze.ContentCardsUpdatedEvent) => {
        console.log(
          `Content Cards updated: ${event.cards.length} cards available.`,
        );
      },
    );

    const bannerCardsSubscription = Braze.addListener(
      Braze.Events.BANNER_CARDS_UPDATED,
      (event: Braze.BannerCardsUpdatedEvent) => {
        console.log(
          `Banner Cards updated: ${event.banners.length} banners available.`,
        );
      },
    );
    // Perform an immediate refresh for default placements on app launch.
    Braze.requestBannersRefresh(['placement_1', 'placement_2', 'sdk-test-2']);

    const featureFlagsSubscription = Braze.addListener(
      Braze.Events.FEATURE_FLAGS_UPDATED,
      flags => {
        console.log(`Feature Flags updated: ${flags.length} flags available.`);
      },
    );

    const sdkAuthErrorSubscription = Braze.addListener(
      Braze.Events.SDK_AUTHENTICATION_ERROR,
      data => {
        console.log(`SDK Authentication Error: ${JSON.stringify(data)}`);
      },
    );

    const pushEventSubscription = Braze.addListener(
      Braze.Events.PUSH_NOTIFICATION_EVENT,
      (event: Braze.PushNotificationEvent) => handlePushPayload(event),
    );

    return () => {
      listener.remove();
      inAppMessageSubscription?.remove();
      inAppMessageListener.remove();
      contentCardsSubscription.remove();
      bannerCardsSubscription.remove();
      featureFlagsSubscription.remove();
      sdkAuthErrorSubscription.remove();
      pushEventSubscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.brazePrimary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <RootStack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Braze Reactor',
          }}
        />
        <RootStack.Screen
          name="ContentCards"
          component={ContentCardsScreen}
          options={{
            title: 'Content Cards',
          }}
        />
        <RootStack.Screen
          name="Banners"
          component={BannersScreen}
          options={{
            title: 'Banners',
          }}
        />
        <RootStack.Screen
          name="FeatureFlags"
          component={FeatureFlagsScreen}
          options={{
            title: 'Feature Flags',
          }}
        />
        <RootStack.Screen
          name="UserManagement"
          component={UserManagementScreen}
          options={{
            title: 'User Management',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
