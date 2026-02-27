import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

type RootStackParamList = {
  Home: undefined;
  ContentCards: undefined;
  Banners: undefined;
  FeatureFlags: undefined;
  UserManagement: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  onPress,
  color,
}) => {
  return (
    <TouchableOpacity
      style={[styles.featureCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const features = [
    {
      title: 'Content Cards',
      description: 'Launch, refresh, and interact with Content Cards',
      icon: '🎴',
      color: Colors.brazeOrange,
      screen: 'ContentCards' as keyof RootStackParamList,
    },
    {
      title: 'Banners',
      description: 'Manage banner placements and properties',
      icon: '📢',
      color: Colors.brazePink,
      screen: 'Banners' as keyof RootStackParamList,
    },
    {
      title: 'Feature Flags',
      description: 'Get and manage feature flags',
      icon: '🚩',
      color: Colors.brazePrimary,
      screen: 'FeatureFlags' as keyof RootStackParamList,
    },
    {
      title: 'User Management',
      description: 'Events, user attributes, SDK controls, and more',
      icon: '⚙️',
      color: Colors.brazePrimaryDark,
      screen: 'UserManagement' as keyof RootStackParamList,
    },
  ];

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Reactor</Text>
          <Text style={styles.subtitle}>feat. Braze React Native SDK</Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onPress={() => navigation.navigate(feature.screen)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Select a category to test Braze SDK features
          </Text>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textGray,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textGray,
  },
  arrow: {
    fontSize: 28,
    color: Colors.textLight,
    marginLeft: 8,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textPlaceholder,
    textAlign: 'center',
  },
});
