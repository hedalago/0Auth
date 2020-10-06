import {
  AuthType,
  hash,
  KeyType,
  Property,
  Signature,
  utf8ToBase64,
} from '@0auth/message';

import { signByKeyType } from '../utils';
import { SecretKey } from '../type';

export function authPackage(
  properties: Property[],
  secret: SecretKey,
): Signature {
  const encodings = properties.map(
    (property) =>
      `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`,
  );
  const hashValue = hash(encodings.join(','));
  const sign = signByKeyType(hashValue, secret.key, secret.type);
  return {
    authType: AuthType.Package,
    keyType: KeyType.ECDSA,
    value: sign,
  };
}
