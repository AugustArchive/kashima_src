export abstract class Plugin {
  /**
   * Abstract method to start the plugin, can be used
   * asynchronously or synchronously
   */
  public abstract mount(): void | Promise<void>;

  /**
   * Abstract method to unload the plugin, can be used
   * asynchronously or synchronously
   */
  public abstract unmount(): void | Promise<void>;
}