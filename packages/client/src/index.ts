import {
  hashProperty, Property, PropertyType, Signature,
} from '@0auth/message';
import {
  DataType, decryptMessage, encryptMessage, getData, getDecryptedMessage, getGeneratedRawKey, StorageType, storeData,
} from './utils';

export type DecryptedMessage = {
  properties: Property[];
  sign: Signature;
};

export function storeSignature(
  key: string,
  properties: Property[],
  sign: Signature,
  storage: StorageType,
  password?: string,
): void {
  const encryptionKey = getGeneratedRawKey(key, storage, password);
  const encrypted = encryptMessage(JSON.stringify({ properties, sign }), encryptionKey);
  storeData(key, encrypted, DataType.Message, storage);
}

export function getSignature(
  key: string,
  storage: StorageType,
  password?: string,
): DecryptedMessage | null {
  const encryptionKey = getData(key, DataType.Key, storage);
  return encryptionKey.matches({
    present: (encKey) => {
      let decryptedMessage;
      if (password !== undefined) decryptedMessage = getDecryptedMessage(key, decryptMessage(encKey, password), storage);
      else decryptedMessage = getDecryptedMessage(key, encKey, storage);
      return decryptedMessage.matches({
        present: (message) => JSON.parse(message) as DecryptedMessage,
        empty: () => null,
      });
    },
    empty: () => null,
  });
}

export function hideProperty(properties: Property[], hideNames: string[]): Property[] {
  return properties.map((property) => (hideNames.includes(property.key)
    ? { type: PropertyType.Hash, key: property.key, value: hashProperty(property) }
    : property));
}
