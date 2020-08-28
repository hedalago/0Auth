import {
  hashProperty, Property, PropertyType, Signature,
} from '@0auth/message';
import {
  DataType, encryptMessage, getDecryptedMessage, getGeneratedRawKey, StorageType, storeData,
} from './utils';

export type DecryptedMessage = {
  properties: Property[];
  sign: Signature;
};

export function storeSignature(
  properties: Property[],
  sign: Signature,
  storage: StorageType,
  password?: string,
): void {
  const key = getGeneratedRawKey(storage, password);
  const encrypted = encryptMessage(JSON.stringify({ properties, sign }), key);
  storeData(encrypted, DataType.Message, storage);
}

export function getSignature(
  storage: StorageType,
  password?: string,
): DecryptedMessage | null {
  const key = getGeneratedRawKey(storage, password);
  const decryptedMessage = getDecryptedMessage(key, storage);
  return decryptedMessage.matches({
    present: (message) => JSON.parse(message) as DecryptedMessage,
    empty: () => null
  });
}

export function hideProperty(properties: Property[], hideNames: string[]): Property[] {
  return properties.map((property) => (hideNames.includes(property.key)
    ? { type: PropertyType.Hash, key: property.key, value: hashProperty(property) }
    : property));
}
