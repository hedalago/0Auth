import { AuthType, hashProperty, Property, Signature } from '@0auth/message';

import { getMerkleRoot, verifyByKeyType } from '../utils';
import { PublicKey } from '../type';

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
