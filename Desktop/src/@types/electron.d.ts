import { Application } from '../lib';

declare module 'electron' {
  interface Remote {
    /**
     * Gets the main application instance (overrided from `Remote#getGlobal`)
     * 
     * [Source](https://github.com/kashima-org/desktop-app/blob/master/src/@types/electron.d.ts#L10)
     */
    getGlobal(name: 'kashima'): Application;
  }
}