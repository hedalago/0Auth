import { Optional } from 'typescript-optional';

import { DataType, StorageType } from '../type';
import { dataTypeToString } from './dataTypeToString';

export function getData(
  key: string,
  dataType: DataType,
  storage: StorageType,
): Optional<string> {
  switch (storage) {
    case StorageType.LocalStorage:
      return Optional.ofNullable(
        localStorage.getItem(dataTypeToString(key, dataType)),
      );
    case StorageType.IndexedDB:
      throw new Error('Unimplemented');
    case StorageType.ChromeExtension:
      throw new Error('Unimplemented');
    default:
      throw new Error('Unreachable code');
  }
}
