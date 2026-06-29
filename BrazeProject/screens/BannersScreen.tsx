import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
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
  const [requestedBannerPlacements, setRequestedBannerPlacements] =
    useState('');
  const [bannerPlacementId, setBannerPlacementId] = useState('');
  const [bannerPropertyType, setBannerPropertyType] = useState<string>('bool');
  const [bannerPropertyKey, setBannerPropertyKey] = useState('');
  const [displayedPlacement, setDisplayedPlacement] = useState('sdk-test-2');
  const [displayedPlacementPlaceholder, setDisplayedPlacementPlaceholder] =
    useState('');
  const [multiBannerInput, setMultiBannerInput] = useState(
    'banner-dismissal-2, banner-dismissal-3, banner-dismissal-4',
  );
  const [multiBannerPlacements, setMultiBannerPlacements] = useState<string[]>(
    [],
  );
  const [knownPlacements, setKnownPlacements] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const checkAvailability = async (placements: string[]) => {
    const entries = await Promise.all(
      placements.map(async placementId => {
        const banner = await Braze.getBanner(placementId);
        return [placementId, banner != null] as const;
      }),
    );
    setAvailability(prev => {
      const next = { ...prev };
      entries.forEach(([placementId, isAvailable]) => {
        next[placementId] = isAvailable;
      });
      return next;
    });
  };

  const requestBannersRefreshPress = () => {
    if (!requestedBannerPlacements) {
      Alert.alert('Error', 'Please enter placement IDs');
      return;
    }
    const bannerPlacements = requestedBannerPlacements
      .split(',')
      .map(idString => idString.trim())
      .filter(idString => idString.length > 0);
    Braze.requestBannersRefresh(bannerPlacements);
    setKnownPlacements(prev =>
      Array.from(new Set([...prev, ...bannerPlacements])),
    );
    showToast('Banner Cards Refreshed');
    // Refresh is async over the network; re-check availability shortly after.
    setTimeout(() => checkAvailability(bannerPlacements), 1500);
  };

  const displaySinglePlacement = (placementId: string) => {
    setDisplayedPlacement(placementId);
    setDisplayedPlacementPlaceholder(placementId);
  };

  const displayAllAvailablePress = () => {
    const placements = knownPlacements.filter(id => availability[id]);
    if (placements.length === 0) {
      Alert.alert(
        'No banners available',
        'No locally available banners to display. Try "Check Availability" after a refresh.',
      );
      return;
    }
    setMultiBannerPlacements(placements);
    showToast(`Displaying ${placements.length} banners`);
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

  const dismissBannerPress = () => {
    if (!bannerPlacementId) {
      Alert.alert('Error', 'Please enter a placement ID');
      return;
    }
    Braze.dismissBanner(bannerPlacementId);
    showToast(`Banner dismissed for: ${bannerPlacementId}`);
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

  const displayMultiBannersPress = () => {
    const placements = multiBannerInput
      .split(',')
      .map(idString => idString.trim())
      .filter(idString => idString.length > 0);
    if (placements.length === 0) {
      Alert.alert('Error', 'Please enter at least one placement ID');
      return;
    }
    setMultiBannerPlacements(placements);
    showToast(`Displaying ${placements.length} banners`);
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

      {knownPlacements.length > 0 && (
        <Card title="Requested Banners">
          <Text style={styles.helperText}>
            Tap a placement to display it below — no need to retype. Dot shows
            whether the banner is available locally.
          </Text>
          <View style={styles.chipRow}>
            {knownPlacements.map(placementId => {
              const isAvailable = availability[placementId];
              return (
                <TouchableOpacity
                  key={placementId}
                  style={styles.chip}
                  onPress={() => displaySinglePlacement(placementId)}>
                  <View
                    style={[
                      styles.chipDot,
                      {
                        backgroundColor:
                          isAvailable === undefined
                            ? Colors.textLight
                            : isAvailable
                              ? Colors.success
                              : Colors.danger,
                      },
                    ]}
                  />
                  <Text style={styles.chipText}>{placementId}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Button
            title="Check Availability"
            onPress={() => checkAvailability(knownPlacements)}
            variant="secondary"
          />
          <Button
            title="Display All Available"
            onPress={displayAllAvailablePress}
            variant="secondary"
          />
        </Card>
      )}

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
        <Button
          title="Dismiss Banner"
          onPress={dismissBannerPress}
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
          <Braze.BrazeBannerView
            placementId={displayedPlacement}
            onDismiss={event => {
              showToast(
                `Banner dismissed (placement: ${event.placementId}, stableKey: ${event.stableKey}, trackingId: ${event.trackingId})`,
              );
              console.log('BrazeBannerView onDismiss', event);
            }}
          />
        </View>
      </Card>

      <Card title="Display Multiple Banners">
        <Input
          label="Placement IDs (comma-separated)"
          placeholder="banner-dismissal-2, banner-dismissal-3, banner-dismissal-4"
          onChangeText={setMultiBannerInput}
          value={multiBannerInput}
          autoCapitalize="none"
        />
        <Button
          title="Display Multiple Banners"
          onPress={displayMultiBannersPress}
        />

        {multiBannerPlacements.map(placementId => (
          <View key={placementId} style={styles.bannerContainer}>
            <Text style={styles.bannerLabel}>Banner: {placementId}</Text>
            <Braze.BrazeBannerView
              placementId={placementId}
              onDismiss={event => {
                showToast(
                  `Banner dismissed (placement: ${event.placementId}, stableKey: ${event.stableKey}, trackingId: ${event.trackingId})`,
                );
                console.log('BrazeBannerView onDismiss', event);
              }}
            />
          </View>
        ))}
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
  helperText: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.backgroundWhite,
    marginRight: 8,
    marginBottom: 8,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textDark,
  },
});
