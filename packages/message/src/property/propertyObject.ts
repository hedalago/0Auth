import {
  PropertyType,
  Property,
  PropertyData,
  stringToDataType,
} from '../type';

export function propertyObject(
  properties: Property[],
): { [key: string]: PropertyData } {
  return properties.reduce(
    (dict: { [key: string]: PropertyData }, property) => {
      if (property.type !== PropertyType.Hash) {
        return {
          ...dict,
          [property.key]: stringToDataType(property.value, property.dataType),
        };
      }
      return dict;
    },
    {},
  );
}
