import { DataType, DecryptedMessage, StorageType } from '../type';
import { getData, decryptMessage, getDecryptedMessage } from '../utils';

export function getSignature(
  key: string,
  storage: StorageType,
  password?: string,
): DecryptedMessage | null {
  const encryptionKey = getData(key, DataType.Key, storage);
  return encryptionKey.matches({
    present: (encKey) => {
      let decryptedMessage;
      if (password !== undefined) {
        decryptedMessage = getDecryptedMessage(
          key,
          decryptMessage(encKey, password),
          storage,
        );
      } else decryptedMessage = getDecryptedMessage(key, encKey, storage);
      return decryptedMessage.matches({
        present: (message) => JSON.parse(message) as DecryptedMessage,
        empty: () => null,
      });
    },
    empty: () => null,
  });
}
