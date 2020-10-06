import { AuthType, objectToProperty, Signature } from '@0auth/message';

import { SecretKey } from '../type';
import { authByAuthType } from '.';

export function issueProperty(
  object: { [key: string]: string },
  secret: SecretKey,
  authType: AuthType,
): Signature {
  const properties = objectToProperty(object);
  return authByAuthType(properties, secret, authType);
}
