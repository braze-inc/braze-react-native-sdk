import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface InfoBoxProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const InfoBox: React.FC<InfoBoxProps> = ({ children, style }) => {
  return (
    <View style={[styles.infoBox, style]}>
      {typeof children === 'string' ? (
        <Text style={styles.infoText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: Colors.infoBackground,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: Colors.infoText,
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'Courier',
    fontWeight: '600',
  },
});

export const InfoText = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.infoText}>{children}</Text>
);

export const CodeText = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.codeText}>{children}</Text>
);
