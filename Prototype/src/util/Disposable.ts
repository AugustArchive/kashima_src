/**
 * Interface to require a `dispose` function
 * to clean any connections and stuff
 */
export interface Disposable {
  /**
   * Disposes anything from that class itself
   * @returns A promise of nothing or `void`
   */
  dispose(): Promise<unknown> | void;
}