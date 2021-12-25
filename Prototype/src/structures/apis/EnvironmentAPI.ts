// Credit: https://github.com/motdotla/dotenv
import fs from 'fs';

interface ConfigOptions {
  encoding?: string | 'utf8';
  path: string;
}

const NEWLINE = '\n';
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES = /\\n/g;
const NEWLINES_MATCH = /\n|\r|\r\n/;

export default class EnvironmentAPI {
  /** Encoding of the file (defaults to 'utf8') */
  public encoding: string | 'utf8';

  /** The path of the .env file */
  public path: string;

  /**
   * Constructs a new instance of the `EnvironmentAPI` class
   * @param options The options used
   */
  constructor(options: ConfigOptions) {
    this.encoding = options.encoding ?? 'utf8';
    this.path = options.path;
  }

  /**
   * Parses the output and returns the new environment keys that were added
   */
  parse() {
    const keys = {};
    const file = fs.readFileSync(this.path, { encoding: this.encoding });
    const contents = file.split(NEWLINES_MATCH);

    for (let i = 0; i < contents.length; i++) {
      const key = contents[i].match(RE_INI_KEY_VAL);
      if (key != null) {
        let [k, v] = [key[1], key[2] ?? ''];
        const end = v.length - 1;

        const doubleQuoted = v[0] === '"' || v[end] === '"';
        const singleQuoted = v[0] === "'" || v[end] === "'"; // eslint-disable-line
        if (singleQuoted || doubleQuoted) {
          v = v.substring(1, end);
          if (doubleQuoted) v = v.replace(RE_NEWLINES, NEWLINE);
        } else {
          v = v.trim();
        }

        keys[k] = v;
      }
    }

    const envKeys = Object.keys(keys);
    for (const k of envKeys) {
      if (!Object.prototype.hasOwnProperty.call(process.env, k)) process.env[k] = keys[k];
    }
  }
}