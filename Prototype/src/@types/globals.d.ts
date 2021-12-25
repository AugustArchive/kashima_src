import { Application } from '../structures/Application';
import { Collection } from '@augu/immutable';
import Dispatch from 'event-dispatcher';
import net from 'net';

declare global {
  namespace NodeJS {
    interface Global {
      dispatchers: Collection<Dispatch.EventDispatcher>;
      kashima: Application;
      socket: net.Socket;
      log: (level: 'info' | 'error' | 'warn' | 'debug', ...message: (string | object)[]) => void;
    }
  }
}