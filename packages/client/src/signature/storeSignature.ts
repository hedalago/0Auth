import { Property, Signature } from '@0auth/message';

import { StorageType, DataType } from '../type';
import { getGeneratedRawKey, encryptMessage, storeData } from '../utils';

export function storeSignature(
  key: string,
  properties: Property[],
  sign: Signature,
  storage: StorageType,
  password?: string,
): void {
  const encryptionKey = getGeneratedRawKey(key, storage, password);
  const encrypted = encryptMessage(
    JSON.stringify({ properties, sign }),
    encryptionKey,
  );
  storeData(key, encrypted, DataType.Message, storage);
}
