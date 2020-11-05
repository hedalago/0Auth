import { PropertyDataType } from '@0auth/message';

export function inputType(type: PropertyDataType): string {
  switch (type) {
    case PropertyDataType.String:
      return 'text';
    case PropertyDataType.Number:
      return 'number';
    case PropertyDataType.Date:
      return 'date';
    case PropertyDataType.Boolean:
      return 'checkbox';
  }
}
