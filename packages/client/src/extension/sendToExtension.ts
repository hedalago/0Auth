import { MessageType } from '@0auth/client';

export function sendToExtension(type: string, message: MessageType): void {
  window.postMessage({ from: 'page', type, message }, '*');
}
