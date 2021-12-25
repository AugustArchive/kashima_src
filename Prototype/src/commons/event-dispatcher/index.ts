global.dispatchers = new (require('@augu/immutable').Collection)();
import { EventDispatcher } from './Dispatcher';

/**
 * Dispatch an event by the `name`
 * @param name The dispatcher's name to fetch from
 * @param event The event to dispatch
 * @param args Any additional arguments for the event to run
 */
export function dispatchEvent(name: string, event: string, ...args: any[]) {
  if (!dispatchers.has(name)) return false;

  const dispatcher = dispatchers.get(name)!;
  dispatcher.emit(event, ...args);

  return true;
}

/**
 * Creates a new Dispatcher instance and adds it to the global scope
 * @param name The dispatcher's name
 */
export function createDispatcher(name: string) {
  const dispatcher = new EventDispatcher(name);
  dispatchers.set(name, dispatcher);

  return dispatcher;
}

export const version: string = '1.0.0';
export * from './Dispatcher';