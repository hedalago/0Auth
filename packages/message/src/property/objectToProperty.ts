import { PropertyType, Property } from '../type';

export function objectToProperty(object: {
  [key: string]: string;
}): Property[] {
  return Object.keys(object).map((key) => ({
    type: PropertyType.Raw,
    key,
    value: object[key],
  }));
}
