import { PropertyDataType, PropertyData } from '@0auth/message';

export function typeOfObject(value: PropertyData): PropertyDataType {
  if (value instanceof Date) {
    return PropertyDataType.Date;
  }
  throw new Error('Unreachable Code in typeOfObject.');
}
