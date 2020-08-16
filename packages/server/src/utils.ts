import sha256 from 'crypto-js/sha256';
import {
  AuthType, KeyType, Property, PropertyType, Signature,
} from '@0auth/message';
import { ec as ECDSA, eddsa as EdDSA } from 'elliptic';

export function utf8ToBase64(str: string): string {
  return Buffer.from(encodeURIComponent(str), 'binary').toString('base64');
}

export function hash(msg: string): string {
  return sha256(msg).toString();
}

export function hashProperty(property: Property): string {
  if (property.type === PropertyType.Hash) return property.value;

  return hash(`${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`);
}

export function getMerkleRoot(properties: string[]): string {
  if (properties.length == 1) return properties[0];

  const parentNodes = [];
  for (let i = 0; i < properties.length - 1; i += 2) parentNodes.push(hash(properties[i] + properties[i + 1]));

  if (properties.length % 2 == 1) parentNodes.push(properties[properties.length - 1]);

  return getMerkleRoot(parentNodes);
}

export function signAccordingToKeyType(hash: string, secret: string, type: KeyType): Signature {
  switch (type) {
    case KeyType.ECDSA: {
      const ecdsa = new ECDSA('secp256k1');
      const key = ecdsa.keyFromPrivate(secret, 'hex');
      return {
        authType: AuthType.Privacy,
        keyType: KeyType.ECDSA,
        value: key.sign(hash).toDER('hex'),
      };
    }
    case KeyType.EDDSA: {
      const eddsa = new EdDSA('ed25519');
      const key = eddsa.keyFromSecret(secret);
      return {
        authType: AuthType.Privacy,
        keyType: KeyType.EDDSA,
        value: key.sign(hash).toHex(),
      };
    }
    default:
      throw new Error('Unreachable Code');
  }
}

export function verifyAccordingToKeyType(hash: string, sign: string, publicKey: string, type: KeyType): boolean {
  switch (type) {
    case KeyType.ECDSA: {
      const ecdsa = new ECDSA('secp256k1');
      const key = ecdsa.keyFromPublic(publicKey, 'hex');
      return key.verify(hash, sign);
    }
    case KeyType.EDDSA: {
      const eddsa = new EdDSA('ed25519');
      const key = eddsa.keyFromPublic(publicKey);
      return key.verify(hash, sign);
    }
    default:
      throw new Error('Unreachable Code');
  }
}
