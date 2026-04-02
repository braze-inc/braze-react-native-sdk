import { Platform } from 'react-native';

export const defaultApiKey = Platform.select({
  ios: 'b7271277-0fec-4187-beeb-3ae6e6fbed11',
  android: 'c04cb57f-8d5f-419a-8807-6f277102374b',
}) ?? '';

export const defaultEndpoint = 'sondheim.braze.com';
