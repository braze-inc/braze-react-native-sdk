import React from 'react';
import { Text, StyleSheet } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
import { Colors } from '../constants/colors';

export type PropertyType = 'bool' | 'num' | 'string' | 'timestamp' | 'json' | 'image';

export const PropertyTypeOptions = [
  { id: 'bool', label: 'Boolean', value: 'bool' },
  { id: 'num', label: 'Number', value: 'num' },
  { id: 'string', label: 'String', value: 'string' },
  { id: 'timestamp', label: 'Timestamp', value: 'timestamp' },
  { id: 'json', label: 'JSON Object', value: 'json' },
  { id: 'image', label: 'Image', value: 'image' },
];

interface PropertyTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  label?: string;
}

export const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  label = 'Property Type',
}) => {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <RadioGroup
        containerStyle={styles.radioGroup}
        radioButtons={PropertyTypeOptions}
        selectedId={selectedType}
        onPress={onTypeChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMedium,
    marginBottom: 8,
  },
  radioGroup: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
});
