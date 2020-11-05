import { Property, PropertyDataType, Signature } from '@0auth/message';
import { Supplier } from '@0auth/message';

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

export type DynamicFormInput = {
  type: PropertyDataType;
  label: string;
  name: string;
};

export type MessageType = {
  properties?: Property[];
  sign?: Signature;
  form?: DynamicFormInput[];
};

export type Listener = {
  add: (key: string, func: Supplier<MessageType, unknown>) => Listener;
  listen: () => void;
};
