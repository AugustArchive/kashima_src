import { remote } from 'electron';

// Core polyfills for the Electron app side
global.kashima = remote.getGlobal('kashima');