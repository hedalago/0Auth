import { PropertyType, Property } from '../type';
import { hash, utf8ToBase64 } from '../utils';

export function hashProperty(property: Property): string {
  if (property.type === PropertyType.Hash) return property.value;

  return hash(`${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`);
}
