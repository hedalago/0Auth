import { Property, PropertyData, PropertyType, typeOfProperty } from '../type';

export function objectToProperty(object: {
  [key: string]: PropertyData;
}): Property[] {
  return Object.keys(object).map((key) => ({
    type: PropertyType.Raw,
    key,
    dataType: typeOfProperty(object[key]),
    value: object[key],
  }));
}
