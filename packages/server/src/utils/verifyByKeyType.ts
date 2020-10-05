import { KeyType } from '@0auth/message';
import { ec as ECDSA, eddsa as EdDSA } from 'elliptic';

export function verifyByKeyType(
  hashValue: string,
  sign: string,
  publicKey: string,
  type: KeyType,
): boolean {
  switch (type) {
    case KeyType.ECDSA: {
      const ecdsa = new ECDSA('secp256k1');
      const key = ecdsa.keyFromPublic(publicKey, 'hex');
      return key.verify(hashValue, sign);
    }
    case KeyType.EDDSA: {
      const eddsa = new EdDSA('ed25519');
      const key = eddsa.keyFromPublic(publicKey);
      return key.verify(hashValue, sign);
    }
    default:
      throw new Error('Unreachable Code');
  }
}
