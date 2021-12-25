import { randomBytes } from 'crypto';
import { isThenable } from '../../util';

/**
 * Representation of a Toast that will pop up when `ToastAPI#append` is called
 */
export interface Toast {
  /** A callback function when the user clicks the `X` button */
  callback?(): Promise<void> | void;

  /** A list of buttons to append to the toast */
  buttons?: ToastButton[];

  /** Amount of milliseconds to timeout. If none is specified, don't do anything until the user clicks `X` */
  timeout?: number;

  /** A message to say when it is popped up */
  message: string;
}

/**
 * Representation of a Toast button, a button to do something when it is popped up
 */
interface ToastButton {
  /** Callback function when the button is clicked */
  callback?(): Promise<void> | void;

  /** A label (less than 16 chars) to display */
  label: string;
}

/**
 * API to handle all toasts when they are added or removed,
 * can be accessable using the `Application#getToasts` function
 */
export default class ToastAPI {
  /** Object of all intervals running, destroyed when the timer runs out */
  private intervals: { [x: string]: NodeJS.Timeout; } = {};

  /** Object of all toasts on the page, destroyed when a user clicks a button from `Toast#buttons` or they click the `X` button */
  private toasts: { [x: string]: Toast } = {};

  /**
   * Appends a toast to the page
   * @param toast The toast to add
   */
  append(toast: Toast) {
    const id = randomBytes(8).toString().replace(/=$/, '');
    this.toasts[id] = toast;

    // Open a new interval to run (if `Toast#timeout` exists)
    if (toast.timeout) this.addInterval(id, toast.timeout);

    // Add the DOM element since it popped up!
    this.addElement();
  }

  /**
   * Closes a toast (when a user clicks `X` or when a button is clicked)
   * @param id The toast's ID
   * @param button If this function was called by a button press
   * @param index The index of the button instance (don't use if it wasn't a button press)
   */
  async close(id: string, button: boolean = false, index: number = 0) {
    if (!this.toasts.hasOwnProperty(id)) throw new SyntaxError(`Toast ${id} wasn't registered. Maybe it was deleted before you called ToastsAPI#close?`);

    const toast = this.toasts[id];

    // If the user clicked a button from that toast
    if (button && !index) throw new SyntaxError(`Toast by ID ${id} was clicked by a button but no index was added.`);
    if (button) {
      if (!toast.buttons![index]) throw new SyntaxError(`Toast button by index ${index} doesn't exist.`);

      // Fetch the button they clicked
      const button = toast.buttons![index];

      if (button.callback) {
        // Check if the callback is a Promise
        // TODO: Add `apply` to the callback to get the Application instance
        if (isThenable(button.callback)) await button.callback();
        else button.callback();
      }
    }

    // If the toast callback exists
    if (toast.callback) {
      // TODO: Add `apply` to the callback to get the Application instance
      if (isThenable(toast.callback)) await toast.callback();
      else toast.callback();
    }

    // Delete the toast from the object
    delete this.toasts[id];

    // Close the DOM element
    this.closeElement();
  }

  /**
   * Adds the toast to the `intervals` object
   * @param id The ID of the toast that was appened to the page
   * @param timeout The amount of milliseconds (or seconds) to remove the DOM element
   */
  private addInterval(id: string, timeout: number) {
    // Mutiply by 1000 if the timeout is less than 1000
    const time = timeout < 1000 ? timeout * 1000 : timeout;
    this.intervals[id] = setTimeout(async () => {
      await this.close(id, false);
      this.closeElement();
    }, time);
  }

  /**
   * Adds the toast itself to the body document
   */
  private addElement() {
    // Create a new div element
    const element = document.createElement('div');

    // Append "toast" and "show" elements
    element.className = 'toast show';

    // Add it to the body of the element (to show it, duh!)
    document.body.appendChild(element);
  }

  /**
   * Removes the toast itself from the body document
   */
  private closeElement() {
    const el = document.getElementsByClassName('toast');
    if (!el) return;

    el.item(0)!.remove();
  }
}