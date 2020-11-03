import { PropertyDataType, PropertyData } from '@0auth/message';
import { typeOfObject } from './typeOfObject';

export function typeOfProperty(value: PropertyData): PropertyDataType {
  switch (typeof value) {
    case 'string':
      return PropertyDataType.String;
    case 'number':
      return PropertyDataType.Number;
    case 'boolean':
      return PropertyDataType.Boolean;
    case 'object':
      return typeOfObject(value);
    default:
      throw new Error('Unreachable Code in typeOfProperty.');
  }
}
