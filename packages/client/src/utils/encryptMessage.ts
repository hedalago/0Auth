import { AES } from 'crypto-js';

export function encryptMessage(message: string, key: string): string {
  return AES.encrypt(message, key).toString();
}
