export function utf8ToBase64(str: string): string {
  return Buffer.from(encodeURIComponent(str), 'binary').toString('base64');
}
