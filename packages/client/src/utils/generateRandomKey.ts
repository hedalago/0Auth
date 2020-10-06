import { hash } from '@0auth/message';

export function generateRandomKey(): string {
  const random = (Math.random() * 100000000).toString();
  const date = new Date().toString();
  return hash(random + date);
}
