import { Plugin as BasePlugin } from 'matsuwa';
import { Updatable } from './Updatable';
import { Types } from '../../util/Constants';

export class Plugin extends Updatable {
  /** The information from the plugin's `manifest.json` file */
  public info: Types.PluginInfo;

  /** The base file */
  public base: BasePlugin;

  /**
   * Creates a new `KashimaPlugin` class
   * @param app The application instance
   * @param info The information from the plugin's `manifest.json` file
   */
  constructor(base: BasePlugin, info: Types.PluginInfo) {
    super('plugin', info.id);

    this.info = info;
    this.base = base;
  }
}