import React, { useState } from 'react';
import { Alert } from 'react-native';
import Braze from '@braze/react-native-sdk';
import {
  Button,
  Input,
  Card,
  ScreenLayout,
  PropertyTypeSelector,
  InfoBox,
  useToast,
} from '../components';

export const FeatureFlagsScreen: React.FC = () => {
  const { toastVisible, message, showToast } = useToast();
  const [featureFlagId, setFeatureFlagId] = useState('');
  const [featureFlagPropertyType, setFeatureFlagPropertyType] =
    useState<string>('bool');
  const [featureFlagPropertyKey, setFeatureFlagPropertyKey] = useState('');

  const refreshFeatureFlagsPress = () => {
    Braze.refreshFeatureFlags();
    showToast('Feature Flags refresh requested');
  };

  const logFeatureFlagImpressionPress = () => {
    if (!featureFlagId) {
      Alert.alert('Error', 'Please enter a feature flag ID');
      return;
    }
    Braze.logFeatureFlagImpression(featureFlagId);
    showToast(`Feature Flag Impression logged for ID: ${featureFlagId}`);
  };

  const getFeatureFlagsPress = async () => {
    const featureFlags = await Braze.getAllFeatureFlags();
    if (featureFlags.length === 0) {
      Alert.alert('Feature Flags', 'No Feature Flags found.');
      return;
    }

    console.log(JSON.stringify(featureFlags));
    console.log(
      `${featureFlags.length} Feature Flags found.`,
      featureFlags.map(flag => flag.id),
    );
    Alert.alert(
      'Feature Flags',
      `Found ${featureFlags.length} Feature Flags. Check console for details.`,
    );
  };

  const getFeatureFlagByIdPress = async () => {
    if (!featureFlagId) {
      Alert.alert('Error', 'Please enter a feature flag ID');
      return;
    }

    const featureFlag = await Braze.getFeatureFlag(featureFlagId);
    if (!featureFlag) {
      Alert.alert('Error', 'No Feature Flag found with this ID');
      return;
    }
    console.log(`Got Feature Flag: ${JSON.stringify(featureFlag)}`);
    console.log(`Feature Flag ID: ${featureFlag.id}`);
    console.log(`Feature Flag Enabled: ${featureFlag.enabled}`);
    console.log(
      `Feature Flag Properties: ${JSON.stringify(featureFlag.properties, null, 2)}`,
    );
    Alert.alert(
      'Feature Flag',
      `ID: ${featureFlag.id}\nEnabled: ${featureFlag.enabled}\n\nCheck console for full details.`,
    );
  };

  const getFeatureFlagPropertyPress = async () => {
    if (!featureFlagId) {
      Alert.alert('Error', 'Please enter a feature flag ID');
      return;
    }

    if (!featureFlagPropertyKey) {
      Alert.alert('Error', 'Please enter a property key');
      return;
    }

    const featureFlag = await Braze.getFeatureFlag(featureFlagId);

    if (!featureFlag) {
      Alert.alert('Error', 'No Feature Flag found with this ID');
      return;
    }

    let property;

    switch (featureFlagPropertyType) {
      case 'bool':
        property = featureFlag.getBooleanProperty(featureFlagPropertyKey);
        break;
      case 'num':
        property = featureFlag.getNumberProperty(featureFlagPropertyKey);
        break;
      case 'string':
        property = featureFlag.getStringProperty(featureFlagPropertyKey);
        break;
      case 'timestamp':
        property = featureFlag.getTimestampProperty(featureFlagPropertyKey);
        break;
      case 'json':
        property = featureFlag.getJsonProperty(featureFlagPropertyKey);
        break;
      case 'image':
        property = featureFlag.getImageProperty(featureFlagPropertyKey);
        break;
      default:
        Alert.alert('Error', 'Invalid property type');
        return;
    }
    console.log(
      `Got Feature Flag ${featureFlagPropertyType} Property:${property}`,
    );
    Alert.alert(
      'Feature Flag Property',
      `${featureFlagPropertyType}: ${JSON.stringify(property)}`,
    );
  };

  return (
    <ScreenLayout
      title="Feature Flags"
      subtitle="Get and manage Braze feature flags"
      toastVisible={toastVisible}
      toastMessage={message}>
      <Card title="All Feature Flags">
        <Button
          title="Refresh Feature Flags"
          onPress={refreshFeatureFlagsPress}
        />
         <Button
          title="Get All Feature Flags (as alert)"
          onPress={getFeatureFlagsPress}
        />
      </Card>

      <Card title="Get a Feature Flag">
        <Input
          label="Feature Flag ID"
          placeholder="Enter flag ID"
          onChangeText={setFeatureFlagId}
          value={featureFlagId}
          autoCapitalize="none"
        />
        <Button
          title="Get Feature Flag by ID"
          onPress={getFeatureFlagByIdPress}
        />
        <Button
          title="Log Feature Flag Impression"
          onPress={logFeatureFlagImpressionPress}
          variant="secondary"
        />
        <Card title="Get Feature Flag Property">
          <Input
            label="Property Key"
            placeholder="Enter property key"
            onChangeText={setFeatureFlagPropertyKey}
            value={featureFlagPropertyKey}
            autoCapitalize="none"
          />
          <PropertyTypeSelector
            selectedType={featureFlagPropertyType}
            onTypeChange={setFeatureFlagPropertyType}
          />
          <Button
            title="Get Feature Flag Property"
            onPress={getFeatureFlagPropertyPress}
          />
        </Card>
      </Card>

      <InfoBox>
        Feature flag details will be logged to the console. Use the ID field
        above for impression logging and property queries.
      </InfoBox>
    </ScreenLayout>
  );
};
