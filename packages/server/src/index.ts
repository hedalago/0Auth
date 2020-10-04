import {
  AuthType,
  hash,
  hashProperty,
  KeyType,
  objectToProperty,
  Property,
  propertyObject,
  Signature,
  utf8ToBase64,
} from '@0auth/message';
import {
  getMerkleRoot,
  publicKeyFromKeyString,
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

type Supplier<T, U> = (value: T) => U;

type Predicate<T> = Supplier<T, boolean>;

type KeySupplier<K, T, U> = (v1: K, v2: T) => U;

type RegisterInfo = {
  validate: KeySupplier<string, Predicate<string>, RegisterInfo>;
  sign: KeySupplier<SecretKey, AuthType, Signature | null>;
};

type SubmitInfo<T> = {
  validate: KeySupplier<string, Predicate<string>, SubmitInfo<T>;
  confirm: Supplier<T, T | null>;
  supply: Supplier<() => T, T | null>;
};

export function publicKeyFromSecret(secret: SecretKey): PublicKey {
  return {
    key: publicKeyFromKeyString(secret.key, secret.type),
    type: secret.type,
  };
}

export function authPrivacy(
  properties: Property[],
  secret: SecretKey,
): Signature {
  const hashes = properties.map((property) => hashProperty(property));
  const merkleRoot = getMerkleRoot(hashes);
  const sign = signByKeyType(merkleRoot, secret.key, secret.type);
  return {
    authType: AuthType.Privacy,
    keyType: secret.type,
    value: sign,
  };
}

export function authPackage(
  properties: Property[],
  secret: SecretKey,
): Signature {
  const encodings = properties.map(
    (property) => `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`,
  );
  const hashValue = hash(encodings.join(','));
  const sign = signByKeyType(hashValue, secret.key, secret.type);
  return {
    authType: AuthType.Package,
    keyType: KeyType.ECDSA,
    value: sign,
  };
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

function authByAuthType(properties: Property[], secret: SecretKey, type: AuthType) {
  switch (type) {
    case AuthType.Privacy:
      return authPrivacy(properties, secret);
    case AuthType.Package:
      return authPackage(properties, secret);
    default:
      throw new Error('Unreachable Code');
  }
}

function verifyByAuthType(properties: Property[], sign: Signature, publicKey: PublicKey, type: AuthType) {
  switch (type) {
    case AuthType.Privacy:
      return verifyPrivacy(properties, sign, publicKey);
    case AuthType.Package:
      return verifyPackage(properties, sign, publicKey);
    default:
      throw new Error('Unreachable Code');
  }
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
      return authByAuthType(properties, key, mode);
    },
  };
}

export function verifyProperty<T>(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
  mode: AuthType,
): SubmitInfo<T> {
  let isPassed = verifyByAuthType(properties, sign, publicKey, mode);
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
    supply(supplier: () => T): T | null {
      if (!isPassed) {
        return null;
      }
      return supplier();
    },
  };
}

export function issueProperty(
  object: { [key: string]: string },
  secret: SecretKey,
  authType: AuthType,
): Signature {
  const properties = objectToProperty(object);
  return authByAuthType(properties, secret, authType);
}
