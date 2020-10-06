import { AES, enc } from 'crypto-js';

export function decryptMessage(encryptedMessage: string, key: string): string {
  return AES.decrypt(encryptedMessage, key).toString(enc.Utf8);
}
