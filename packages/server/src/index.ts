import {
  AuthType, KeyType, Property, Signature,
} from '@0auth/message';
import {
  getMerkleRoot,
  hash,
  hashProperty,
  signAccordingToKeyType,
  utf8ToBase64,
  verifyAccordingToKeyType,
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
  return signAccordingToKeyType(merkleRoot, secret.key, secret.type);
}

export function authPackage(
  properties: Property[],
  secret: SecretKey,
): Signature {
  const encodings = properties.map((property) => `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`);
  const hashValue = hash(encodings.join(','));
  return signAccordingToKeyType(hashValue, secret.key, secret.type);
}

export function verifyPrivacy(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
): boolean {
  if (sign.authType !== AuthType.Privacy || sign.keyType !== publicKey.type) return false;

  const hashes = properties.map((property) => hashProperty(property));
  const merkleRoot = getMerkleRoot(hashes);
  return verifyAccordingToKeyType(
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
  return verifyAccordingToKeyType(hashValue, sign.value, publicKey.key, publicKey.type);
}
