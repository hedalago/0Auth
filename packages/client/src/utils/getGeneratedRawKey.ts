import { DataType, StorageType } from '../type';
import { storeData } from './storeData';
import { getData } from './getData';
import { generateRandomKey } from './generateRandomKey';
import { decryptMessage } from './decryptMessage';
import { encryptMessage } from './encryptMessage';

export function getGeneratedRawKey(
  key: string,
  storage: StorageType,
  password?: string,
): string {
  const encryptionKey = getData(key, DataType.Key, storage);
  return encryptionKey.matches({
    present: (encrypted) =>
      password !== undefined ? decryptMessage(encrypted, password) : encrypted,
    empty: () => {
      const newEncryptionKey = generateRandomKey();
      if (password !== undefined) {
        storeData(
          key,
          encryptMessage(newEncryptionKey, password),
          DataType.Key,
          storage,
        );
      } else storeData(key, newEncryptionKey, DataType.Key, storage);
      return newEncryptionKey;
    },
  });
}
