import { hash } from '@0auth/message';

export function getMerkleRoot(properties: string[]): string {
  if (properties.length === 1) return properties[0];

  const parentNodes = [];
  for (let i = 0; i < properties.length - 1; i += 2) {
    parentNodes.push(hash(properties[i] + properties[i + 1]));
  }

  if (properties.length % 2 === 1) {
    parentNodes.push(properties[properties.length - 1]);
  }

  return getMerkleRoot(parentNodes);
}
