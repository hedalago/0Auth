import { PropertyData } from '@0auth/message';

export function utf8ToBase64(value: PropertyData): string {
  if (typeof value === 'string') {
    return Buffer.from(encodeURIComponent(value), 'binary').toString('base64');
  }
  return Buffer.from(
    encodeURIComponent(JSON.stringify(value)),
    'binary',
  ).toString('base64');
}
