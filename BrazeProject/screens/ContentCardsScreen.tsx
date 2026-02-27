import React from 'react';
import { Alert } from 'react-native';
import Braze from '@braze/react-native-sdk';
import {
  Button,
  Card,
  ScreenLayout,
  InfoBox,
  InfoText,
  CodeText,
  useToast,
} from '../components';

// Change to `true` to automatically log clicks, button clicks,
// and impressions for in-app messages and content cards.
const automaticallyInteract = false;

export const ContentCardsScreen: React.FC = () => {
  const { toastVisible, message, showToast } = useToast();

  const launchContentCardsPress = () => {
    Braze.launchContentCards(true);
  };

  const requestContentCardsRefresh = () => {
    Braze.requestContentCardsRefresh();
    showToast('Content Cards Refreshed');
  };

  const getContentCards = async () => {
    const cards = await Braze.getContentCards();
    if (cards.length === 0) {
      Alert.alert('Content Cards', 'No Content Cards found.');
      return;
    }

    console.log(`${cards.length} Content Cards found.`);
    for (const card of cards) {
      console.log('Content Card:');
      console.log(`- id: ${card.id}`);
      console.log(`- created: ${card.created}`);
      console.log(`- dismissed: ${card.dismissed}`);
      if (automaticallyInteract) {
        Braze.logContentCardClicked(card.id);
        Braze.logContentCardImpression(card.id);
        Braze.logContentCardDismissed(card.id);
      }
    }
    Alert.alert(
      'Content Cards',
      `Found ${cards.length} Content Cards. Check console for details.`,
    );
  };

  const getCachedContentCards = async () => {
    const cards = await Braze.getCachedContentCards();
    console.log(`${cards.length} cached Content Cards found.`);
    if (cards.length === 0) {
      Alert.alert('Content Cards', 'No cached Content Cards found.');
    }

    for (const card of cards) {
      console.log('Cached Content Card:');
      console.log(`- id: ${card.id}`);
      console.log(`- created: ${card.created}`);
      console.log(`- dismissed: ${card.dismissed}`);
      if (automaticallyInteract) {
        Braze.logContentCardClicked(card.id);
        Braze.logContentCardImpression(card.id);
        Braze.logContentCardDismissed(card.id);
      }
    }
    Alert.alert(
      'Content Cards',
      `Found ${cards.length} cached Content Cards. Check console for details.`,
    );
  };

  return (
    <ScreenLayout
      title="Content Cards"
      subtitle="Manage and interact with Braze Content Cards"
      toastVisible={toastVisible}
      toastMessage={message}>
      <Card title="Launch & Refresh">
        <Button
          title="Launch Content Cards"
          onPress={launchContentCardsPress}
        />
        <Button
          title="Request Refresh"
          onPress={requestContentCardsRefresh}
        />
      </Card>

      <Card title="Get Content Cards">
        <Button
          title="Get Content Cards & Log Interactions"
          onPress={getContentCards}
        />
        <Button
          title="Get Cached Content Cards & Log Interactions"
          onPress={getCachedContentCards}
        />
      </Card>

      <InfoBox>
        <InfoText>
          Content Cards will be logged to the console. Set{' '}
          <CodeText>automaticallyInteract</CodeText> to true to automatically
          log clicks, impressions, and dismissals.
        </InfoText>
      </InfoBox>
    </ScreenLayout>
  );
};
