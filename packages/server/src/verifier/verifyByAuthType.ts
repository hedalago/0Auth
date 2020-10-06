import { AuthType, Property, Signature } from '@0auth/message';

import { PublicKey } from '../type';
import { verifyPackage, verifyPrivacy } from '.';

export function verifyByAuthType(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey,
  type: AuthType,
): boolean {
  switch (type) {
    case AuthType.Privacy:
      return verifyPrivacy(properties, sign, publicKey);
    case AuthType.Package:
      return verifyPackage(properties, sign, publicKey);
    default:
      throw new Error('Unreachable Code');
  }
}
