import { Property, Signature } from '@0auth/message';

export type DecryptedMessage = {
  properties: Property[];
  sign: Signature;
};

export enum StorageType {
  LocalStorage = 'LOCAL_STORAGE',
  IndexedDB = 'INDEXED_DB',
  ChromeExtension = 'CHROME_EXTENSION',
}

export enum DataType {
  Key = 'KEY',
  Message = 'MESSAGE',
}
