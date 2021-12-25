declare module 'event-dispatcher' {
  import { Collection } from '@augu/immutable';

  namespace Dispatch {
    /**
     * Dispatch an event by it's `name`
     * @param name The dispatcher's name to fetch from
     * @param event The event to dispatch
     * @param args Any additional arguments for the event to run
     */
    export function dispatchEvent(name: string, event: string, ...args: any[]): boolean;

    /**
     * Creates a new `EventDispatcher` and adds it to the global dispatchers collection
     * @param name The event dispatcher's name
     */
    export function createDispatcher(name: string): EventDispatcher;

    /** Returns the version of `event-dispatcher` */
    export const version: string;

    /** Represents a callback listener */
    type Listener = (...args: any[]) => void;

    /**
     * The event dispatcher is a extended version of Node.js' `EventEmitter`
     * but it's commonly used to dispatch any event from any `EventDispatcher`
     * from the global scope: `dispatchers`
     */
    export class EventDispatcher {
      /**
       * Constructs a new Dispatcher instance
       * @param name The dispatcher name
       */
      constructor(name?: string);

      /**
       * A list of events that the dispatcher has
       */
      public events: Collection<Listener[]>;

      /**
       * The name of the dispatcher instance
       */
      public name: string;

      /**
       * Removes a listener from this event dispatcher
       * @param event The event to remove
       */
      public remove(event: string, listener: (...args: any[]) => void): boolean;

      /**
       * Emits an event and runs any applicable listeners
       * @param event The event to run
       * @param args Any additional arguments to run it
       */
      public emit(event: string, ...args: any[]): void;

      /**
       * Attaches an listener to this dispatcher
       * @param event The event to run
       * @param listener The listener function
       */
      public on(event: string, listener: Listener): this;

      /**
       * Attaches an listener to this dispatcher *once*
       * @param event The event to run
       * @param listener The listener function
       */
      public once(event: string, listener: Listener): this;

      /**
       * Gets a length of all listeners avaliable
       */
      public size(): number;

      /**
       * Gets a length of all listeners from an event
       * @param event The event
       */
      public size(event: string): number;

      /**
       * Fetches all listeners from the event
       * @param event The event
       * @param index The index to find
       */
      public find(event: string, index?: number): Listener | undefined;
    }
  }

  global {
    /** Collection of all dispatchers avaliable */
    var dispatchers: Collection<Dispatch.EventDispatcher>;
  }

  export = Dispatch;
}