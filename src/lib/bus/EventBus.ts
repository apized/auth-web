import { createContext, useContext } from 'react';

export class EventBus {
  private map: {
    [key: string]: {
      listeners: ((event: MessageEvent<any>) => any)[];
      receiver: BroadcastChannel;
      sender: BroadcastChannel;
    };
  };

  constructor() {
    this.map = {};
  }

  private ensure(event: string) {
    if (!this.map[event]) {
      this.map[event] = {
        listeners: [],
        receiver: new BroadcastChannel(event),
        sender: new BroadcastChannel(event),
      };
    }
    return this.map[event];
  }

  effect(event: string, listener: (event: MessageEvent<any>) => any) {
    this.on(event, listener);
    return () => this.remove(event, listener);
  }

  on(event: string, listener: (event: MessageEvent<any>) => any) {
    const entry = this.ensure(event);
    if (entry.listeners.indexOf(listener) === -1) {
      entry.receiver.addEventListener('message', listener);
    }
  }

  dispatch(event: string, data?: any) {
    console.groupCollapsed(event);
    console.trace();
    console.groupEnd();
    const entry = this.ensure(event);
    entry.sender.postMessage(typeof data !== 'undefined' ? data : {});
  }

  remove(event: string, listener: (e: any) => any) {
    const entry = this.ensure(event);
    entry.receiver.removeEventListener('message', listener);
  }
}

const EventBusContext = createContext(new EventBus());

export const useEventBus = () => {
  return useContext(EventBusContext);
};
