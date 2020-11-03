import { PropertyDataType, PropertyData } from '@0auth/message';

export function stringToDataType(
  value: PropertyData,
  dataType: PropertyDataType,
): PropertyData {
  switch (dataType) {
    case PropertyDataType.String:
      return value;
    case PropertyDataType.Number:
      return Number(value);
    case PropertyDataType.Date:
      if (typeof value === 'string') {
        return new Date(JSON.parse(value));
      }
      return value;
    case PropertyDataType.Boolean:
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
  }
}
