import { existsSync } from 'fs';
import { execSync } from 'child_process';

const ROOT_REGEX = /%ROOT%/g;
const getCommand = (file: string) => process.platform === 'win32' ? `del /f ${file}` : `rm ${file}`;

/**
 * Removes a file
 * @param file The file to remove
 * @returns A boolean if it was successful or not
 */
export const rmFile = (file: string) => {
  file = file.replace(ROOT_REGEX, process.cwd());

  if (!existsSync(file)) return false;

  try {
    execSync(getCommand(file));
    return true;
  } catch(ex) {
    return false;
  }
};