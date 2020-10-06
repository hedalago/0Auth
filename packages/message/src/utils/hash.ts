import sha256 from 'crypto-js/sha256';

export function hash(msg: string): string {
  return sha256(msg).toString();
}
