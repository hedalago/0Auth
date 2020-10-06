import { PropertyType, Property } from '../type';

export function propertyObject(
  properties: Property[],
): { [key: string]: string } {
  return properties.reduce((dict: { [key: string]: string }, property) => {
    if (property.type !== PropertyType.Hash) {
      return {
        ...dict,
        [property.key]: property.value,
      };
    }
    return dict;
  }, {});
}
