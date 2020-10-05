import { AuthType, Property, propertyObject, Signature } from '@0auth/message';

import { SubmitInfo, Predicate, PublicKey } from '../type';
import { verifyByAuthType } from './verifyByAuthType';

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
