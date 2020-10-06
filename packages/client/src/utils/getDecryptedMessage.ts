import { Optional } from 'typescript-optional';

import { DataType, StorageType } from '../type';
import { decryptMessage } from './decryptMessage';
import { getData } from './getData';

export function getDecryptedMessage(
  key: string,
  encryptionKey: string,
  storage: StorageType,
): Optional<string> {
  const message = getData(key, DataType.Message, storage);
  return message.matches({
    present: (encrypted) =>
      Optional.of(decryptMessage(encrypted, encryptionKey)),
    empty: () => Optional.empty(),
  });
}
