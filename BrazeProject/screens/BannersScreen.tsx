import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Braze from '@braze/react-native-sdk';
import {
  Button,
  Input,
  Card,
  ScreenLayout,
  PropertyTypeSelector,
  useToast,
} from '../components';
import { Colors } from '../constants/colors';

export const BannersScreen: React.FC = () => {
  const { toastVisible, message, showToast } = useToast();
  const [requestedBannerPlacements, setRequestedBannerPlacements] = useState(
    'placement_1, placement_2',
  );
  const [bannerPlacementId, setBannerPlacementId] = useState('');
  const [bannerPropertyType, setBannerPropertyType] = useState<string>('bool');
  const [bannerPropertyKey, setBannerPropertyKey] = useState('');
  const [displayedPlacement, setDisplayedPlacement] = useState('sdk-test-2');
  const [displayedPlacementPlaceholder, setDisplayedPlacementPlaceholder] =
    useState('');

  const requestBannersRefreshPress = () => {
    if (!requestedBannerPlacements) {
      Alert.alert('Error', 'Please enter placement IDs');
      return;
    }
    const bannerPlacements = requestedBannerPlacements
      .split(',')
      .map(idString => idString.trim());
    Braze.requestBannersRefresh(bannerPlacements);
    showToast('Banner Cards Refreshed');
  };

  const getBannerByIdPress = async () => {
    if (!bannerPlacementId) {
      Alert.alert('Error', 'Please enter a placement ID');
      return;
    }

    const banner = await Braze.getBanner(bannerPlacementId);
    if (!banner) {
      Alert.alert('Error', 'No Banner Card found for this placement ID');
      return;
    }
    showToast(`Found Banner Card. Check the console logs for details.`);
    console.log(`Got Banner Card: ${JSON.stringify(banner, null, '\t')}`);
  };

  const logBannerImpressionPress = () => {
    if (!bannerPlacementId) {
      Alert.alert('Error', 'Please enter a placement ID');
      return;
    }
    Braze.logBannerImpression(bannerPlacementId);
    showToast(`Banner Impression logged for: ${bannerPlacementId}`);
  };

  const logBannerClickPress = () => {
    if (!bannerPlacementId) {
      Alert.alert('Error', 'Please enter a placement ID');
      return;
    }
    Braze.logBannerClick(bannerPlacementId, null);
    showToast(`Banner Click logged for: ${bannerPlacementId}`);
  };

  const getBannerPropertyPress = async () => {
    if (!bannerPlacementId) {
      Alert.alert('Error', 'Please enter a placement ID');
      return;
    }

    if (!bannerPropertyKey) {
      Alert.alert('Error', 'Please enter a property key');
      return;
    }

    const banner = await Braze.getBanner(bannerPlacementId);
    if (!banner) {
      Alert.alert('Error', 'No Banner Card found for this placement ID');
      return;
    }

    let property;
    switch (bannerPropertyType) {
      case 'bool':
        property = banner.getBooleanProperty(bannerPropertyKey);
        break;
      case 'num':
        property = banner.getNumberProperty(bannerPropertyKey);
        break;
      case 'string':
        property = banner.getStringProperty(bannerPropertyKey);
        break;
      case 'timestamp':
        property = banner.getTimestampProperty(bannerPropertyKey);
        break;
      case 'json':
        property = banner.getJsonProperty(bannerPropertyKey);
        break;
      case 'image':
        property = banner.getImageProperty(bannerPropertyKey);
        break;
      default:
        Alert.alert('Error', 'Invalid property type');
        return;
    }
    console.log(`Got Banner ${bannerPropertyType} Property: ${property}`);
    Alert.alert(
      'Banner Property',
      `${bannerPropertyType}: ${JSON.stringify(property)}`,
    );
  };

  const changeDisplayedBannerPress = async () => {
    setDisplayedPlacement(displayedPlacementPlaceholder);
    const banner = await Braze.getBanner(displayedPlacementPlaceholder);
    if (!banner) {
      Alert.alert('Error', 'No Banner Card found for this placement ID');
    }
  };

  return (
    <ScreenLayout
      title="Banners"
      subtitle="Manage banner placements and properties"
      toastVisible={toastVisible}
      toastMessage={message}>
      <Card title="Refresh Banners">
        <Input
          label="Placement IDs (comma-separated)"
          placeholder="placement_1, placement_2"
          onChangeText={setRequestedBannerPlacements}
          value={requestedBannerPlacements}
          autoCapitalize="none"
        />
        <Button
          title="Request Banners Refresh"
          onPress={requestBannersRefreshPress}
        />
      </Card>

      <Card title="Get Banner by ID">
        <Input
          label="Placement ID"
          placeholder="Enter placement ID"
          onChangeText={setBannerPlacementId}
          value={bannerPlacementId}
          autoCapitalize="none"
        />
        <Button
          title="Get Banner by Placement ID"
          onPress={getBannerByIdPress}
        />
        <Button
          title="Log Impression"
          onPress={logBannerImpressionPress}
          variant="secondary"
        />
        <Button
          title="Log Click"
          onPress={logBannerClickPress}
          variant="secondary"
        />
        <Card title="Get Banner Property">
          <PropertyTypeSelector
            selectedType={bannerPropertyType}
            onTypeChange={setBannerPropertyType}
          />
          <Input
            label="Property Key"
            placeholder="Enter property key"
            onChangeText={setBannerPropertyKey}
            value={bannerPropertyKey}
            autoCapitalize="none"
          />
          <Button
            title="Get Banner Property"
            onPress={getBannerPropertyPress}
          />
        </Card>
      </Card>

      <Card title="Display Banner">
        <Input
          label="Banner Placement ID"
          placeholder="Enter placement ID to display"
          onChangeText={setDisplayedPlacementPlaceholder}
          value={displayedPlacementPlaceholder}
          autoCapitalize="none"
        />
        <Button
          title="Change Displayed Banner"
          onPress={changeDisplayedBannerPress}
        />

        <View style={styles.bannerContainer}>
          <Text style={styles.bannerLabel}>
            Current Banner: {displayedPlacement}
          </Text>
          <Braze.BrazeBannerView placementID={displayedPlacement} />
        </View>
      </Card>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
  },
  bannerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMedium,
    marginBottom: 12,
  },
});
