import { Collection, Pair } from '@augu/immutable';
import { randomBytes } from 'crypto';
import { Application } from '..';

interface Toast {
  /** The buttons displayed (if any) */
  buttons?: ToastButton[];

  /** Timeout to pan out, if none is specifed, then it'll stay until the user clicks `X` */
  timeout?: number;

  /** The message of the toast (new lines can be appended with `\n`) */
  message: string;

  /** The ID of the toast, for removing it when it's done rendering */
  id: string;
}

interface ToastButton {
  /** A callback function when the button is clicked */
  callback(this: Application): void;

  /** The text of the button (shorter or equal to 16 characters) */
  text: string;
}

interface CreateElementOptions {
  /** The attributes to set */
  attributes?: (Pair<string, string>)[];

  /** Any setters to set */
  setters?: (Pair<string, string | TemplateStringsArray>)[];
}

export default class ToastAPI {
  /** The active elements avaliable */
  private activeDOM: { [x: string]: HTMLDivElement } = {};

  /** The active amount of toasts */
  private active: Collection<Toast> = new Collection();

  /** The application itself */
  private app: Application;

  /**
   * Constructs a new instance
   */
  constructor(app: Application) {
    log('warn', 'Toasts API is under construction, beaware of using it!');
    this.app = app;
  }

  /**
   * Opens the toast and make it appear
   * @param toast The toast itself
   * @returns The ID of the toast
   */
  open(toast: Toast) {
    const id = randomBytes(8).toString('hex');
    
    log('info', `Received to open toast with ID "${id}"`);
    this.active.set(id, toast);
    //this._addTimeout(toast);
    this._openDOM(id);

    return id;
  }

  /**
   * Closes the toast
   * @param id The ID of the toast
   */
  close(id: string) {
    if (!this.active.has(id)) throw new Error(`Toast by ID "${id}" is not active, did it close already?`);

    const toast = this.active.get(id)!;
    //this._removeTimeout(toast);
    //this._closeDOM(id);
  }

  /**
   * Creates an element
   * @param attributes Collection of attributes
   */
  private createElement(type: string, options?: CreateElementOptions) {
    const element = document.createElement(type);
    if (options && options.attributes) {
      for (const pair of options.attributes) element.setAttribute(pair.getRight(), pair.getLeft());
    }

    if (options && options.setters) {
      for (const pair of options.setters) element[pair.getRight()] = pair.getLeft();
    }

    return element;
  }

  /**
   * Opens the element to the user
   * @param id The toast ID
   */
  private _openDOM(id: string) {
    const toast = this.active.get(id)!;
    const base = this.createElement('div');
  }
}