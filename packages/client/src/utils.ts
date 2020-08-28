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

export function dataTypeToString(dataType: DataType): string {
  switch (dataType) {
    case DataType.Key:
      return 'Key';
    case DataType.Message:
      return 'Message';
    default:
      throw new Error('Unreachable code');
  }
}

export function storeData(data: string, dataType: DataType, storage: StorageType): void {
  switch (storage) {
    case StorageType.LocalStorage:
      localStorage.setItem(dataTypeToString(dataType), data);
      return;
    case StorageType.IndexedDB:
      throw new Error('Unimplemented');
    case StorageType.ChromeExtension:
      throw new Error('Unimplemented');
    default:
      throw new Error('Unreachable code');
  }
}

export function getData(dataType: DataType, storage: StorageType): Optional<string> {
  switch (storage) {
    case StorageType.LocalStorage:
      return Optional.ofNullable(localStorage.getItem(dataTypeToString(dataType)));
    case StorageType.IndexedDB:
      throw new Error('Unimplemented');
    case StorageType.ChromeExtension:
      throw new Error('Unimplemented');
    default:
      throw new Error('Unreachable code');
  }
}

export function getGeneratedRawKey(
  storage: StorageType,
  password?: string,
): string {
  const key = getData(DataType.Key, storage);
  return key.matches({
    present: (encrypted) => password !== undefined ? decryptMessage(encrypted, password) : encrypted,
    empty: () => {
      const newKey = generateRandomKey();
      if (password !== undefined) storeData(encryptMessage(newKey, password), DataType.Key, storage);
      else storeData(newKey, DataType.Key, storage);
      return newKey;
    },
  });
}

export function getDecryptedMessage(
  key: string,
  storage: StorageType,
): Optional<string> {
  const message = getData(DataType.Message, storage);
  return message.matches({
    present: (encrypted) => Optional.of(decryptMessage(encrypted, key)),
    empty: () => Optional.empty()
  })
}
