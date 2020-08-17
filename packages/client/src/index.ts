import { Property, Signature } from '@0auth/message';
import axios from 'axios';
import {
  DataType,
  encryptMessage,
  getDecryptedMessage,
  getGeneratedRawKey,
  StorageType,
  storeData,
} from './utils';

export type DecryptedMessage = {
  properties: Property[];
  sign: Signature;
};

export async function registerInfo(
  requestUrl: string,
  properties: Property[],
): Promise<Signature> {
  const regex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if (!regex.test(requestUrl)) {
    throw new Error('The requestUrl is not validated one. Please check your URL.');
  }
  const response = await axios.post(requestUrl, { properties });
  if (!response.status.toString().startsWith('2')) {
    throw new Error('Something went wrong. Please make sure API path was clear or server-side function was implemented.');
  }
  const signature = response.data as Signature;

  return signature;
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
