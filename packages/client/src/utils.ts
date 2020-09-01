import { AES, enc } from 'crypto-js';
import { hash } from '@0auth/message';
import { Optional } from 'typescript-optional';

export enum StorageType {
  LocalStorage = 'LOCAL_STORAGE',
  IndexedDB = 'INDEXED_DB',
  ChromeExtension = 'CHROME_EXTENSION',
}

export enum DataType {
  Key = 'KEY',
  Message = 'MESSAGE'
}

export function encryptMessage(message: string, key: string): string {
  return AES.encrypt(message, key).toString();
}

export function decryptMessage(encryptedMessage: string, key: string): string {
  return AES.decrypt(encryptedMessage, key).toString(enc.Utf8);
}

export function generateRandomKey(): string {
  const random = (Math.random() * 100000000).toString();
  const date = new Date().toString();
  return hash(random + date);
}

export function dataTypeToString(key: string, dataType: DataType): string {
  switch (dataType) {
    case DataType.Key:
      return `Key_${key}`;
    case DataType.Message:
      return `Message_${key}`;
    default:
      throw new Error('Unreachable code');
  }
}

export function storeData(
  key: string,
  data: string,
  dataType: DataType,
  storage: StorageType,
): void {
  switch (storage) {
    case StorageType.LocalStorage:
      localStorage.setItem(dataTypeToString(key, dataType), data);
      return;
    case StorageType.IndexedDB:
      throw new Error('Unimplemented');
    case StorageType.ChromeExtension:
      throw new Error('Unimplemented');
    default:
      throw new Error('Unreachable code');
  }
}

export function getData(key: string, dataType: DataType, storage: StorageType): Optional<string> {
  switch (storage) {
    case StorageType.LocalStorage:
      return Optional.ofNullable(localStorage.getItem(dataTypeToString(key, dataType)));
    case StorageType.IndexedDB:
      throw new Error('Unimplemented');
    case StorageType.ChromeExtension:
      throw new Error('Unimplemented');
    default:
      throw new Error('Unreachable code');
  }
}

export function getGeneratedRawKey(
  key: string,
  storage: StorageType,
  password?: string,
): string {
  const encryptionKey = getData(key, DataType.Key, storage);
  return encryptionKey.matches({
    present: (encrypted) => (password !== undefined ? decryptMessage(encrypted, password) : encrypted),
    empty: () => {
      const newEncryptionKey = generateRandomKey();
      if (password !== undefined) {
        storeData(key, encryptMessage(newEncryptionKey, password), DataType.Key, storage);
      } else storeData(key, newEncryptionKey, DataType.Key, storage);
      return newEncryptionKey;
    },
  });
}

export function getDecryptedMessage(
  key: string,
  encryptionKey: string,
  storage: StorageType,
): Optional<string> {
  const message = getData(key, DataType.Message, storage);
  return message.matches({
    present: (encrypted) => Optional.of(decryptMessage(encrypted, encryptionKey)),
    empty: () => Optional.empty(),
  });
}
