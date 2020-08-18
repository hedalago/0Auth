import sha256 from 'crypto-js/sha256';

export enum PropertyType {
  Raw,
  Hash,
}

export type Property = {
  type: PropertyType;
  key: string;
  value: string;
};

export enum AuthType {
  Privacy,
  Package,
  Local,
}

export enum KeyType {
  EDDSA,
  ECDSA,
}

export type Signature = {
  authType: AuthType;
  keyType: KeyType;
  value: string;
};

export function utf8ToBase64(str: string): string {
  return Buffer.from(encodeURIComponent(str), 'binary').toString('base64');
}

export function hash(msg: string): string {
  return sha256(msg).toString();
}

export function hashProperty(property: Property): string {
  if (property.type === PropertyType.Hash) return property.value;

  return hash(`${utf8ToBase64(property.key)}:${utf8ToBase64(property.value)}`);
}
