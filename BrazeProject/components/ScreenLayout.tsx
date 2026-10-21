import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from './Toast';
import { Colors } from '../constants/colors';

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  toastVisible: boolean;
  toastMessage: string;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  subtitle,
  children,
  toastVisible,
  toastMessage,
}) => {
  return (
    <SafeAreaProvider style={styles.safeArea}>
      <Toast message={toastMessage} visible={toastVisible} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {(title || subtitle) && (
          <View style={styles.header}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        )}
        {children}
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
    marginBottom: 24,
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
  },
});
