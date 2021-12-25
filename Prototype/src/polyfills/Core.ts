import { remote } from 'electron';

// Core polyfills for the Electron app side
global.dispatchers = remote.getGlobal('dispatchers');
global.kashima = remote.getGlobal('kashima');