import { DataType, StorageType } from '../type';
import { dataTypeToString } from './dataTypeToString';

export function storeData(
  key: string,
  data: string,
  dataType: DataType,
  storage: StorageType,
): void {
  switch (storage) {
    case StorageType.LocalStorage:
      localStorage.setItem(dataTypeToString(key, dataType), data);
      return;
    case StorageType.IndexedDB:
      throw new Error('Unimplemented');
    case StorageType.ChromeExtension:
      throw new Error('Unimplemented');
    default:
      throw new Error('Unreachable code');
  }
}
