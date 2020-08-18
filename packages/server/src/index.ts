import {
  AuthType, hash, hashProperty, KeyType, Property, Signature, utf8ToBase64,
} from '@0auth/message';
import {
  getMerkleRoot,
  signByKeyType,
  verifyByKeyType,
} from './utils';

type SecretKey = {
  type: KeyType;
  key: string;
};

type PublicKey = {
  type: KeyType;
  key: string;
};

export function authPrivacy(
  properties: Property[],
  secret: SecretKey,
): Signature {
  const hashes = properties.map((property) => hashProperty(property));
  const merkleRoot = getMerkleRoot(hashes);
  return signByKeyType(merkleRoot, secret.key, secret.type);
}

export function authPackage(
  properties: Property[],
  secret: SecretKey,
): Signature {
  const encodings = properties.map((property) => `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`);
  const hashValue = hash(encodings.join(','));
  return signByKeyType(hashValue, secret.key, secret.type);
}

export function verifyPrivacy(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
): boolean {
  if (sign.authType !== AuthType.Privacy || sign.keyType !== publicKey.type) return false;

  const hashes = properties.map((property) => hashProperty(property));
  const merkleRoot = getMerkleRoot(hashes);
  return verifyByKeyType(
    merkleRoot,
    sign.value,
    publicKey.key,
    publicKey.type,
  );
}

export function verifyPackage(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
): boolean {
  const encodings = properties.map((property) => `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`);
  const hashValue = hash(encodings.join(','));
  return verifyByKeyType(hashValue, sign.value, publicKey.key, publicKey.type);
}
