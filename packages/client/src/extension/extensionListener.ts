import { Listener, MessageType } from '@0auth/client';
import { Supplier } from '@0auth/message';

export function extensionListener(): Listener {
  const functionMap: { [key: string]: Supplier<MessageType, unknown> } = {};
  return {
    add(key, func) {
      functionMap[key] = func;
      return this;
    },
    listen() {
      window.addEventListener(
        'message',
        (event) => {
          if (event.source !== window) return;

          if (event.data.from && event.data.from === 'content') {
            functionMap[event.data.type](event.data.message);
          }
        },
        false,
      );
    },
  };
}
