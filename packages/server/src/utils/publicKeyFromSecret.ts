import { publicKeyFromKeyString } from '.';

import { SecretKey, PublicKey } from '../type';

export function publicKeyFromSecret(secret: SecretKey): PublicKey {
  return {
    key: publicKeyFromKeyString(secret.key, secret.type),
    type: secret.type,
  };
}
