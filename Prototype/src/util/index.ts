import * as Constants from './Constants';
import { execSync } from 'child_process';
import { homedir } from 'os';

/**
 * Gets the seperator corresponding to the Operating System the user is using
 */
export const sep = process.platform === 'win32' ? '\\' : '/';

/**
 * Appends paths from the user's directory (i.e: `C:\Users\Noel` or `/home/Noel`)
 * @param paths Any paths to append to it
 * @returns A string of the newly created path
 */
export const getArbitrayPath = (...paths: string[]) => `${homedir()}${sep}${paths.join(sep)}`;

/**
 * Checks if the user is running Node.js v10 or higher
 */
export const isNode10 = () => {
  const version = process.version.split('.')[0].replace('v', '');
  return Number(version) > 10;
};

/**
 * Check if `value` is thenable (or just a Promise)
 * @param value The value to check
 */
export const isThenable = (value: any): value is Promise<any> => value instanceof Promise && typeof value.then !== 'undefined';

/**
 * Gets the commit hash
 */
export const getCommitHash = () => execSync('git rev-parse HEAD').toString().trim();

// Export all values
export { Constants };
export * from './Disposable';
export * from './IgnoreFile';