import { Collection } from '@augu/immutable';

/**
 * A function to represent a Listener callback
 */
export type Listener = (...args: any[]) => void;

/** The dispatcher instance itself */
export class EventDispatcher {
  /**
   * A list of all events
   */
  public events: Collection<Listener[]>;

  /**
   * The name of the dispatcher
   */
  public name: string;

  /**
   * Creates a new instance of the Dispatcher class
   * @param name The name of the dispatcher
   */
  constructor(name?: string) {
    this.events = new Collection();
    this.name = name || 'unknown';
  }

  /**
   * Gets the size of an event
   * @param event The event to find
   */
  size(event: string): number;

  /**
   * Gets the size of all events
   */
  size(): number;

  /**
   * Gets the size of an event
   * @param event The event to find
   */
  size(event?: string) {
    if (event) {
      const listeners = this.events.get(event);
      if (!listeners) return 0;

      return listeners.length;
    } else {
      return this.events.size;
    }
  }

  /**
   * Emits an event and concurrently runs all listeners
   * @param event The event
   * @param args Any additional arguments to run the listener
   */
  emit(event: string, ...args: any[]) {
    if (!this.events.has(event)) return false;

    const listeners = this.events.get(event)!;
    for (const listener of listeners) listener(...args);

    return true;
  }

  /**
   * Fetches all listeners from the event
   * @param event The event
   * @param index The index to find the listener
   */
  find(event: string, index: number = 0) {
    if (!this.events.has(event)) return undefined;

    const listeners = this.events.get(event)!;
    return listeners[index] || undefined;
  }

  /**
   * Removes a listener from an event
   * @param event The event to find
   * @param listener The listener to remove
   */
  remove(event: string, listener: Listener) {
    if (!this.events.has(event)) return false;

    const listeners = this.events.get(event)!;
    if (!listeners.length) return false;

    for (let i = listeners.length; i > 0; i--) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        break;
      }
    }

    if (!listeners.length) {
      this.events.delete(event);
      return true;
    } else {
      this.events.set(event, listeners);
      return true;
    }
  }

  /**
   * Attaches an listener to this dispatcher
   * @param event The event to run
   * @param listener The listener function
   */
  on(event: string, listener: Listener) {
    if (!this.events.has(event)) {
      const listeners = [listener];
      this.events.set(event, listeners);
    } else {
      const listeners = this.events.get(event)!;
      listeners.push(listener);
      this.events.set(event, listeners);
    }

    return this;
  }

  /**
   * Attaches an listener to this dispatcher *once*
   * @param event The event to run
   * @param listener The listener function
   */
  once(event: string, listener: Listener) {
    const wrapper = () => {
      listener();
      this.remove(event, listener);
    };

    if (!this.events.has(event)) {
      const listeners = [wrapper];
      this.events.set(event, listeners);
    } else {
      const listeners = this.events.get(event)!;
      listeners.push(wrapper);

      this.events.set(event, listeners);
    }

    return this;
  }
}