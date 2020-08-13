import { AES, enc, SHA256 } from 'crypto-js';

export enum StorageType {
  LocalStorage,
  IndexedDB,
  ChromeExtension,
}

export enum DataType {
  Key,
  Message
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
  return SHA256(random + date).toString();
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

export function getData(dataType: DataType, storage: StorageType): string | null {
  switch (storage) {
    case StorageType.LocalStorage:
      return localStorage.getItem(dataTypeToString(dataType));
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
  if (key !== null) {
    if (password !== undefined) return decryptMessage(key, password);
    return key;
  }
  const newKey = generateRandomKey();
  if (password !== undefined) storeData(encryptMessage(newKey, password), DataType.Key, storage);
  else storeData(newKey, DataType.Key, storage);

  return newKey;
}

export function getDecryptedMessage(
  key: string,
  storage: StorageType,
): string | null {
  const message = getData(DataType.Message, storage);
  if (message === null) return null;
  return decryptMessage(message, key);
}
