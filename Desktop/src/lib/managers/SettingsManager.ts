import { writeFileSync, existsSync } from 'fs';
import { Constants, sep } from '../../util';
import { app } from 'electron';

const file = `${app.getPath('userData')}${sep}config.json`;
export default class ConfigManager {
  /** The configuration itself */
  private cache: Constants.Types.Configuration;

  /** Constructs a new instance of the ConfigManager */
  constructor() {
    this.cache = this.load();
  }

  load(): Constants.Types.Configuration {
    if (!existsSync(file)) {
      writeFileSync(file, JSON.stringify(Constants.DefaultSettings, null, 2));
      return this.load(); // Use this as a recursive function so it'll actually load
    }

    try {
      return JSON.parse(file);
    } catch(ex) {
      return Constants.DefaultSettings;
    }
  }

  /**
   * Gets a value from the configuration
   * @param section The section to get splitted by `.`
   * @returns The value or `null`
   */
  get<T>(section: string): T | null;

  /**
   * Gets a value with a default value
   * @param section The section to fetch, splitted by `.`
   * @param defaultValue The default value if it couldn't find anything
   */
  get<T>(section: string, defaultValue: T): T;
  get<T>(section: string, defaultValue?: T) {
    const nodes = section.split('.');
    let cache: any = this.cache;

    try {
      for (const fragment of nodes) cache = cache[fragment];
      return (cache === void 0 || cache === undefined) ? defaultValue ? defaultValue! : null : (cache as T);
    } catch {
      return null; // This throws an error if the object key wasn't found
    }
  }

  /**
   * Sets a value to the config
   * @param section The section to fetch, splitted by `.`
   * @param value The value to set as
   */
  set<T = any>(section: string, value: T) {
    const nodes = section.split('.');
    let cache: any = this.cache;
    
    for (const fragment of nodes) cache = fragment;
    
    this.cache[cache] = value;
    this.save();
  }

  save() {
    writeFileSync(file, JSON.stringify(this.cache, null, 2));
  }
}