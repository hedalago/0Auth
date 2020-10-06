import { DataType } from '../type';

export function dataTypeToString(key: string, dataType: DataType): string {
  switch (dataType) {
    case DataType.Key:
      return `Key_${key}`;
    case DataType.Message:
      return `Message_${key}`;
    default:
      throw new Error('Unreachable code');
  }
}
