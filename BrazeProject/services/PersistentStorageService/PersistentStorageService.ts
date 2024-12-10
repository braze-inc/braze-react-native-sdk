import AsyncStorage from '@react-native-async-storage/async-storage';

const parseValue = (value: any) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const stringifyValue = (value: any): string => {
  return typeof value === 'string' ? value : JSON.stringify(value);
};

export namespace PersistentStorageService {
  export const getSafe = async<T>(key: string, defaultValue: T): Promise<T> => {
    if (!key) {
      return defaultValue;
    }

    try {
      const rawValue = await AsyncStorage.getItem(key);

      const parsedValue = parseValue(rawValue || 'null');

      return parsedValue !== undefined && parsedValue !== null ? parsedValue : defaultValue;
    } catch (error) {
      console.error(error);
    }

    return defaultValue;
  };

  export const setSafe = async <T>(key: string, value: NonNullable<T>) => {
    if (!key) {
      return;
    }

    try {
      await AsyncStorage.setItem(key, stringifyValue(value));
    } catch (error) {
      console.error(error);
    }
  };
}
