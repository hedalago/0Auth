import { Property, Signature } from '@0auth/message';
import {
  DataType,
  encryptMessage, getDecryptedMessage,
  getGeneratedRawKey,
  StorageType,
  storeData,
} from './utils';

export type DecryptedMessage = {
  properties: Property[];
  sign: Signature;
}

export async function registerInfo(
  url: string,
  properties: Property[],
  // TODO: @ts-ignore should be removed, when below function is implemented.
  // @ts-ignore
): Promise<Signature> {
  // TODO: Not implemented yet.
}

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
  if (decryptedMessage === null) return null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(decryptedMessage);
}
