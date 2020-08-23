import {
  AuthType,
  hash,
  hashProperty,
  KeyType,
  Property,
  Signature,
  utf8ToBase64,
} from '@0auth/message';
import {
  getMerkleRoot, propertyObject, signByKeyType, verifyByKeyType,
} from './utils';

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

type SubmitInfo<T> = {
  validate: KeySupplier<string, Predicate<string>, SubmitInfo<T>>;
  confirm: Supplier<T, T | null>;
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

export function authProperty(properties: Property[]): RegisterInfo {
  let isPassed = true;
  const propertiesObj = propertyObject(properties);
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

export function verifyProperty<T>(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
  mode: AuthType,
): SubmitInfo<T> {
  let isPassed = true;
  switch (mode) {
    case AuthType.Privacy:
      isPassed = verifyPrivacy(properties, sign, publicKey);
      break;
    case AuthType.Package:
      isPassed = verifyPackage(properties, sign, publicKey);
      break;
    default:
  }
  const propertiesObj = propertyObject(properties);
  return {
    validate(key: string, func: Predicate<string>): SubmitInfo<T> {
      if (!func(propertiesObj[key])) {
        isPassed = false;
      }
      return this;
    },
    confirm(response: T): T | null {
      if (!isPassed) {
        return null;
      }
      return response;
    },
  };
}
