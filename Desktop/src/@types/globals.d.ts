import { Application } from '../lib';

declare global {
  var kashima: Application;
  var log: (level: 'info' | 'error' | 'warn' | 'debug', ...message: any[]) => void;

  namespace NodeJS {
    interface Global {
      kashima: Application;
      log: (level: 'info' | 'error' | 'warn' | 'debug', ...message: any[]) => void;
    }
  }
}