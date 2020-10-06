import { KeyType } from '@0auth/message';
import { ec as ECDSA, eddsa as EdDSA } from 'elliptic';

export function signByKeyType(
  hashValue: string,
  secret: string,
  type: KeyType,
): string {
  switch (type) {
    case KeyType.ECDSA: {
      const ecdsa = new ECDSA('secp256k1');
      const key = ecdsa.keyFromPrivate(secret, 'hex');
      return key.sign(hashValue).toDER('hex');
    }
    case KeyType.EDDSA: {
      const eddsa = new EdDSA('ed25519');
      const key = eddsa.keyFromSecret(secret);
      return key.sign(hashValue).toHex();
    }
    default:
      throw new Error('Unreachable Code');
  }
}
