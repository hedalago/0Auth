import {
  AuthType,
  hash,
  hashProperty,
  KeyType,
  Property,
  Signature,
  utf8ToBase64,
  PropertyType,
} from '@0auth/message';
import { getMerkleRoot, signByKeyType, verifyByKeyType } from './utils';

type SecretKey = {
  type: KeyType;
  key: string;
};

type PublicKey = {
  type: KeyType;
  key: string;
};

type Supplier<T, U> = (value: T) => U;

type Predicate<T> = Supplier<T, boolean>;

type KeySupplier<K, T, U> = (v1: K, v2: T) => U;

type RegisterInfo = {
  validate: KeySupplier<string, Predicate<string>, RegisterInfo>;
  sign: KeySupplier<SecretKey, AuthType, Signature | null>;
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
  const encodings = properties.map(
    (property) => `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`,
  );
  const hashValue = hash(encodings.join(','));
  return signByKeyType(hashValue, secret.key, secret.type);
}

export function verifyPrivacy(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
): boolean {
  if (sign.authType !== AuthType.Privacy || sign.keyType !== publicKey.type) {
    return false;
  }

  const hashes = properties.map((property) => hashProperty(property));
  const merkleRoot = getMerkleRoot(hashes);
  return verifyByKeyType(merkleRoot, sign.value, publicKey.key, publicKey.type);
}

export function verifyPackage(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
): boolean {
  const encodings = properties.map(
    (property) => `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`,
  );
  const hashValue = hash(encodings.join(','));
  return verifyByKeyType(hashValue, sign.value, publicKey.key, publicKey.type);
}

export function signRegister(properties: Property[]): RegisterInfo {
  let isPassed = true;
  const propertiesObj = properties.reduce(
    (dict: { [key: string]: string }, property) => {
      if (property.type !== PropertyType.Hash) {
        return {
          ...dict,
          [property.key]: property.value,
        };
      }
      return dict;
    },
    {},
  );
  return {
    validate(key: string, func: Predicate<string>): RegisterInfo {
      if (!func(propertiesObj[key])) {
        isPassed = false;
      }

      return this;
    },
    sign(key: SecretKey, mode: AuthType): Signature | null {
      if (!isPassed) {
        return null;
      }
      switch (mode) {
        case AuthType.Privacy:
          return authPrivacy(properties, key);
        case AuthType.Package:
          return authPackage(properties, key);
        default:
          return null;
      }
    },
  };
}
