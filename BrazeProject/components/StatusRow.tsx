import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface StatusRowProps {
  label: string;
  value: string;
}

export const StatusRow: React.FC<StatusRowProps> = ({ label, value }) => {
  const valueColor =
    value === 'Enabled' || value === 'Registered'
      ? Colors.success
      : value === 'Disabled'
        ? Colors.danger
        : Colors.textMedium;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}: </Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMedium,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});
