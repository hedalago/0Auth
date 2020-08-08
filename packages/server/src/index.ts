import {AuthType, KeyType, Property, Signature} from "@0auth/message";
import {getMerkleRoot, hashProperty, signAccordingToKeyType, verifyAccordingToKeyType} from "./utils";

type SecretKey = {
  type: KeyType;
  key: string;
};

type PublicKey = {
  type: KeyType;
  key: string;
};

export function authPrivacy(properties: Property[], secret: SecretKey): Signature {
  const hashes = properties.map(property => hashProperty(property)),
    merkleRoot = getMerkleRoot(hashes);
  return signAccordingToKeyType(merkleRoot, secret.key, secret.type);
}

// TODO: @ts-ignore should be removed, when below function is implemented.
// @ts-ignore
export function authPackage(
  properties: Property[],
  secret: SecretKey
): Signature {
  // TODO: Not implemented yet.
}

export function verifyPrivacy(properties: Property[], sign: Signature, publicKey: PublicKey): boolean {
  if (sign.authType !== AuthType.Privacy || sign.keyType !== publicKey.type)
    return false;

  const hashes = properties.map(property => hashProperty(property)),
    merkleRoot = getMerkleRoot(hashes);
  return verifyAccordingToKeyType(merkleRoot, sign.value, publicKey.key, publicKey.type);
}

// TODO: @ts-ignore should be removed, when below function is implemented.
// @ts-ignore
export function verifyPackage(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey
): boolean {
  // TODO: Not implemented yet.
}
