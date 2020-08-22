import {
  AuthType, hash, KeyType, Signature,
} from '@0auth/message';
import { ec as ECDSA, eddsa as EdDSA } from 'elliptic';

export function getMerkleRoot(properties: string[]): string {
  if (properties.length === 1) return properties[0];

  const parentNodes = [];
  for (let i = 0; i < properties.length - 1; i += 2) {
    parentNodes.push(hash(properties[i] + properties[i + 1]));
  }

  if (properties.length % 2 === 1) {
    parentNodes.push(properties[properties.length - 1]);
  }

  return getMerkleRoot(parentNodes);
}

export function signByKeyType(
  hashValue: string,
  secret: string,
  type: KeyType,
): Signature {
  switch (type) {
    case KeyType.ECDSA: {
      const ecdsa = new ECDSA('secp256k1');
      const key = ecdsa.keyFromPrivate(secret, 'hex');
      return {
        authType: AuthType.Privacy,
        keyType: KeyType.ECDSA,
        value: key.sign(hashValue).toDER('hex'),
      };
    }
    case KeyType.EDDSA: {
      const eddsa = new EdDSA('ed25519');
      const key = eddsa.keyFromSecret(secret);
      return {
        authType: AuthType.Privacy,
        keyType: KeyType.EDDSA,
        value: key.sign(hashValue).toHex(),
      };
    }
    default:
      throw new Error('Unreachable Code');
  }
}

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
