import { PropertyData, PropertyDataType } from '@0auth/message';

export function defaultValue(type: PropertyDataType): PropertyData {
  switch (type) {
    case PropertyDataType.String:
      return '';
    case PropertyDataType.Number:
      return 0;
    case PropertyDataType.Date:
      return new Date();
    case PropertyDataType.Boolean:
      return false;
  }
}
