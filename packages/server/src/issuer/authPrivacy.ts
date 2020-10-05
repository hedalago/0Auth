import { AuthType, Property, Signature, hashProperty } from '@0auth/message';

import { signByKeyType, getMerkleRoot } from '../util';
import { SecretKey } from '../type';

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
