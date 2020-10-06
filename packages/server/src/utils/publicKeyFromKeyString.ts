import { KeyType } from '@0auth/message';
import { ec as ECDSA, eddsa as EdDSA } from 'elliptic';

export function publicKeyFromKeyString(
  keyString: string,
  type: KeyType,
): string {
  switch (type) {
    case KeyType.ECDSA: {
      const ecdsa = new ECDSA('secp256k1');
      const secret = ecdsa.keyFromPrivate(keyString, 'hex');
      return secret.getPublic('hex');
    }
    case KeyType.EDDSA: {
      const eddsa = new EdDSA('ed25519');
      const secret = eddsa.keyFromSecret(keyString);
      return secret.getPublic('hex');
    }
    default:
      throw new Error('Unreachable Code');
  }
}
