import { hashProperty, Property, PropertyType } from '@0auth/message';

export function hideProperty(
  properties: Property[],
  hideNames: string[],
): Property[] {
  return properties.map((property) =>
    hideNames.includes(property.key)
      ? {
          type: PropertyType.Hash,
          key: property.key,
          value: hashProperty(property),
        }
      : property,
  );
}
