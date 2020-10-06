import { AuthType, Property, Signature } from '@0auth/message';

import { SecretKey } from '../type';
import { authPrivacy, authPackage } from '.';

export function authByAuthType(
  properties: Property[],
  secret: SecretKey,
  type: AuthType,
): Signature {
  switch (type) {
    case AuthType.Privacy:
      return authPrivacy(properties, secret);
    case AuthType.Package:
      return authPackage(properties, secret);
    default:
      throw new Error('Unreachable Code');
  }
}
