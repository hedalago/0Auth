import {
  AuthType,
  Predicate,
  Property,
  propertyObject,
  Signature,
} from '@0auth/message';

import { RegisterInfo, SecretKey } from '../type';
import { authByAuthType } from '@0auth/server';

export function authProperty(properties: Property[]): RegisterInfo {
  let isPassed = true;
  const propertiesObj = propertyObject(properties);
  return {
    validate(key: string, func: Predicate<unknown>): RegisterInfo {
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
