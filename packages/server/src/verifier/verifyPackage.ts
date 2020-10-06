import { hash, Property, Signature, utf8ToBase64 } from '@0auth/message';

import { verifyByKeyType } from '../utils';
import { PublicKey } from '../type';

export function verifyPackage(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
): boolean {
  const encodings = properties.map(
    (property) =>
      `${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`,
  );
  const hashValue = hash(encodings.join(','));
  return verifyByKeyType(hashValue, sign.value, publicKey.key, publicKey.type);
}
