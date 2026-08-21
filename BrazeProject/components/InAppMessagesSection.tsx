import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
import Braze from '@braze/react-native-sdk';
import { Button } from './Button';
import { Card } from './Card';
import { InfoBox, InfoText } from './InfoBox';
import { Colors } from '../constants/colors';

type BrazeInAppMessage = Braze.BrazeInAppMessage;

interface InAppMessagesSectionProps {
  showToast: (message: string) => void;
}

export const InAppMessagesSection: React.FC<InAppMessagesSectionProps> = ({
  showToast,
}) => {
  const [useBrazeUIOption, setUseBrazeUIOption] = useState<string>('false');
  const [isSubscribedToIAM, setIsSubscribedToIAM] = useState(false);
  const [subscribedUseBrazeUIOption, setSubscribedUseBrazeUIOption] = useState<
    string | null
  >(null);
  const [lastInAppMessage, setLastInAppMessage] =
    useState<BrazeInAppMessage | null>(null);
  const inAppMessageSubscriptionRef =
    useRef<ReturnType<typeof Braze.subscribeToInAppMessage>>(undefined);

  useEffect(() => {
    return () => {
      inAppMessageSubscriptionRef.current?.remove();
    };
  }, []);

  const useBrazeUIButtons = useMemo(
    () => [
      { id: 'true', label: 'Use Default Braze UI', value: 'true' },
      { id: 'false', label: 'Handle in JavaScript', value: 'false' },
    ],
    [],
  );

  const useBrazeUIOptionPress = (id: string) => {
    setUseBrazeUIOption(id);
    setLastInAppMessage(null);
  };

  const subscribeToInAppMessagePress = () => {
    inAppMessageSubscriptionRef.current?.remove();
    setLastInAppMessage(null);

    const useBrazeUI = useBrazeUIOption === 'true';
    inAppMessageSubscriptionRef.current = Braze.subscribeToInAppMessage(
      useBrazeUI,
      (event: Braze.InAppMessageEvent) => {
        // The raw event payload only carries whichever fields the native
        // message actually had set (e.g. `buttons` is entirely absent when
        // there are no buttons). Re-parsing via `BrazeInAppMessage` gives a
        // fully-normalized object (e.g. `buttons` defaults to `[]`) matching
        // what `logInAppMessageClicked`/etc. expect.
        const inAppMessage = new Braze.BrazeInAppMessage(
          event.inAppMessage.inAppMessageJsonString,
        );
        console.log(`In-app message received: ${inAppMessage.toString()}`);
        setLastInAppMessage(inAppMessage);
        showToast('In-app message received');
      },
    );
    setIsSubscribedToIAM(true);
    setSubscribedUseBrazeUIOption(useBrazeUIOption);
    showToast(`Subscribed (useBrazeUI: ${useBrazeUI})`);
  };

  const unsubscribeFromInAppMessagePress = () => {
    inAppMessageSubscriptionRef.current?.remove();
    inAppMessageSubscriptionRef.current = undefined;
    setIsSubscribedToIAM(false);
    setSubscribedUseBrazeUIOption(null);
    setLastInAppMessage(null);
    showToast('Unsubscribed from in-app messages');
  };

  const hideCurrentInAppMessage = () => {
    Braze.hideCurrentInAppMessage();
    showToast('Message dismissed');
  };

  const logInAppMessageImpressionPress = () => {
    if (!lastInAppMessage) {
      showToast('No in-app message received yet');
      return;
    }
    Braze.logInAppMessageImpression(lastInAppMessage);
    showToast('Impression logged');
  };

  const logInAppMessageClickedPress = () => {
    if (!lastInAppMessage) {
      showToast('No in-app message received yet');
      return;
    }
    Braze.logInAppMessageClicked(lastInAppMessage);
    showToast('Click logged');
  };

  const performInAppMessageActionPress = () => {
    if (!lastInAppMessage) {
      showToast('No in-app message received yet');
      return;
    }
    // A buttonId of -1 tells the native layer to perform the message's own
    // click action rather than a specific button's action.
    Braze.performInAppMessageAction(lastInAppMessage, -1);
    showToast('Message action performed');
  };

  const logInAppMessageButtonClickedPress = (buttonId: number) => {
    if (!lastInAppMessage) {
      return;
    }
    Braze.logInAppMessageButtonClicked(lastInAppMessage, buttonId);
    showToast(`Button ${buttonId} click logged`);
  };

  const performInAppMessageButtonActionPress = (buttonId: number) => {
    if (!lastInAppMessage) {
      return;
    }
    Braze.performInAppMessageButtonAction(lastInAppMessage, buttonId);
    showToast(`Button ${buttonId} action performed`);
  };

  return (
    <Card title="In-App Messages">
      <Text style={styles.sectionLabel}>Subscription Mode</Text>
      <RadioGroup
        containerStyle={styles.radioGroup}
        radioButtons={useBrazeUIButtons}
        selectedId={useBrazeUIOption}
        onPress={useBrazeUIOptionPress}
      />
      {isSubscribedToIAM && subscribedUseBrazeUIOption !== useBrazeUIOption && (
        <Text style={styles.pendingChangeLabel}>
          Subscription mode changed — tap "Re-subscribe to In-App Messages"
          to apply it.
        </Text>
      )}
      <Button
        title={
          isSubscribedToIAM
            ? 'Re-subscribe to In-App Messages'
            : 'Subscribe to In-App Messages'
        }
        onPress={subscribeToInAppMessagePress}
      />
      {isSubscribedToIAM && (
        <Button
          title="Unsubscribe from In-App Messages"
          onPress={unsubscribeFromInAppMessagePress}
          variant="secondary"
        />
      )}
      {useBrazeUIOption === 'true' ? (
        <>
          {/*
            Only meaningful when the default Braze UI is presenting the
            message. In "Handle in JavaScript" mode, the default UI never
            displays it (the message is discarded/deferred instead), so
            there's nothing for this to dismiss.
          */}
          <Button
            title="Dismiss Current In-App Message"
            onPress={hideCurrentInAppMessage}
            variant="secondary"
          />
          {lastInAppMessage && (
            <InfoBox>
              <InfoText>
                {'Message received — the default Braze UI is presenting it ' +
                  'and logging its own impression/click events. Switch to ' +
                  '"Handle in JavaScript" to take over presentation and ' +
                  'logging yourself.'}
              </InfoText>
            </InfoBox>
          )}
        </>
      ) : (
        <>
          {lastInAppMessage && (
            <InfoBox>
              <InfoText>
                {`Last message: ${
                  lastInAppMessage.header ||
                  lastInAppMessage.message ||
                  '(no text)'
                }\nType: ${lastInAppMessage.messageType}\nButtons: ${
                  lastInAppMessage.buttons.length
                }`}
              </InfoText>
            </InfoBox>
          )}

          {/*
            These calls are only meaningful when the app itself is
            presenting the message (useBrazeUI: false). When the default
            Braze UI is presenting it instead, it logs impressions/clicks
            on its own — calling these here too would double-log.
          */}
          <Button
            title="Log Impression"
            onPress={logInAppMessageImpressionPress}
            variant="secondary"
          />
          <Button
            title="Log Click"
            onPress={logInAppMessageClickedPress}
            variant="secondary"
          />
          <Button
            title="Perform Message Action"
            onPress={performInAppMessageActionPress}
            variant="secondary"
          />

          {lastInAppMessage?.buttons.map((button, index) => (
            <React.Fragment key={button.id ?? index}>
              <Button
                title={`Log Button ${button.id} Click ("${button.text}")`}
                onPress={() => logInAppMessageButtonClickedPress(button.id)}
                variant="secondary"
              />
              <Button
                title={`Perform Button ${button.id} Action`}
                onPress={() =>
                  performInAppMessageButtonActionPress(button.id)
                }
                variant="secondary"
              />
            </React.Fragment>
          ))}
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMedium,
    marginTop: 16,
    marginBottom: 8,
  },
  radioGroup: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pendingChangeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.brazeOrange,
    marginBottom: 8,
  },
});
