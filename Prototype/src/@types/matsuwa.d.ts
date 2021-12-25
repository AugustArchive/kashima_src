/* eslint-disable no-unused-vars */
/// <reference types="electron" />

declare module 'matsuwa' {
  import { EventDispatcher } from 'event-dispatcher';
  import { IncomingMessage } from 'http';
  import { Collection } from '@augu/immutable';
  import { Ichigo } from '@augu/ichigo';
  import { URL } from 'url';
  import net from 'net';
  
  /** The main namespace for all internals */
  namespace Matsuwa {
    /**
     * The current version of Matsuwa
     */
    export const version: string;

    /** Utils namespace */
    export namespace utils {
      /**
       * Removes a file
       * @param file The file to remove
       * @returns A boolean if it was successful or not
       */
      export function rmFile(file: string): boolean;

      /**
       * Pauses the process until the duration is up
       * @param duration The duration in milliseconds
       */
      export function sleep(duration: number): Promise<unknown>;
    }

    export namespace http {
      /**
       * The HTTP method to use when fetching data
       */
      type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'connect' | 'trace' | 'options';
      interface HttpRequestOptions {
        /**
         * If we should use zlib to compress data
         */
        compress?: boolean;

        /**
         * Number of milliseconds before we abort the request
         */
        timeout?: number;

        /**
         * Any headers to supply
         */
        headers?: { [x: string]: string };

        /**
         * Any data to supply
         */
        data?: any;
      }

      interface HTTPResponse {
        /**
         * The text of the status code
         */
        statusCodeText: string;

        /**
         * The status code of the request
         */
        statusCode: number;

        /**
         * A bool to check if it was a success (200) or a fail (over 300)
         */
        successful: boolean;

        /**
         * Convert the body to JSON
         */
        json<T = { [x: string]: any }>(): T;

        /**
         * Converts the body to text
         */
        text(): string;

        /**
         * Gets the stream value of the request
         */
        stream(): IncomingMessage; // This is a Stream extendable
      }

      class HttpRequest {
        /**
         * How to send the data when we been hitted with `HttpRequest#execute`
         */
        public sendDataAs?: string;

        /**
         * The options to use
         */
        public options: Matsuwa.http.HttpRequestOptions;

        /**
         * The method to use when requesting
         */
        public method: HttpMethod;

        /**
         * The URL of the request as an `URL` object
         */
        public url: URL;

        /**
         * Appends a header to the request
         * @param name An object list of headers or the header name to append
         * @param value The header value (if `name` is a string)
         * @returns The request itself to chain methods
         */
        public header(name: string, value: string): this;

        /**
         * Appends a header to the request
         * @param name A key-value pair of headers to add
         * @returns The request itself to chain methods
         */
        public header(name: { [x: string]: string }): this;

        /**
         * Appends data to the request
         * @param data The data instance to add
         * @param sendDataAs What should we parse when hitted with `HttpRequest#execute`
         * @warning If you are using form data, add `sendDataAs` with the 'form' value!
         * @returns This instance to chain methods
         */
        public body(data: any, sendDataAs?: 'json' | 'form' | 'text' | 'buffer'): this;

        /**
         * Compresses the data
         * @warning If you are getting streams, it'll return a zlib of Inflate (`deflate`) or Gunzip (`gzip`)
         * @returns This instance to chain methods
         */
        public compress(): this;

        /**
         * Number of milliseconds to abort the request
         * @param ms The amount of milliseconds to abort the request
         * @returns This instance to chain methods
         */
        public timeout(ms: number): this;

        /**
         * Adds a query to the URL (`?a=b` or `&a=b`)
         * @param name An object list of queries to add or the query to use
         * @param value The value to use (if `name` is a string)
         * @returns This instance to chain methods
         */
        public query(name: string, value: string): this;

        /**
         * Adds a query to the URL (`?a=b` or `&a=b`)
         * @param name Key-value pairs of how many query parameters to add
         * @returns This instance to chain methods
         */
        public query(name: { [x: string]: string }): this;

        /**
         * Executes the request and returns the response
         * @returns A promise of the response
         */
        public execute(): Promise<Matsuwa.http.HTTPResponse>;
      }

      class Profile {
        /**
         * The settings object to override
         */
        public settings: Matsuwa.http.HttpRequestOptions;

        /**
         * The profile's name
         */
        public name: string;
      }

      export class HttpClient {
        /**
         * A list of the avaliable profiles to use
         */
        public profiles: Collection<Matsuwa.http.Profile>;

        /**
         * The profile the http client is currently using
         */
        public profile: Matsuwa.http.Profile;

        /**
         * Uses a profile that is avaliable from `HttpClient#profiles`
         * @param name The profile name to use
         * @returns The client instance to chain methods
         */
        public use(name: string): this;

        /**
         * Adds a profile to the collection of profiles avaliable
         * @param name The profile's name
         * @param settings The settings to override
         * @returns The client instance to chain methods
         */
        public addProfile(name: string, settings: Matsuwa.http.HttpRequestOptions): this;

        /**
         * Creates a new HTTP request with the `GET` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public get(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;

        /**
         * Creates a new HTTP request with the `OPTIONS` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public options(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;

        /**
         * Creates a new HTTP request with the `DELETE` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public delete(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;

        /**
         * Creates a new HTTP request with the `PUT` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public put(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;

        /**
         * Creates a new HTTP request with the `POST` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public post(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;

        /**
         * Creates a new HTTP request with the `PATCH` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public patch(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;

        /**
         * Creates a new HTTP request with the `TRACE` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public trace(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;

        /**
         * Creates a new HTTP request with the `CONNECT` method
         * @param url The url to request to
         * @param options Any additional options. If a profile is used,
         * then it'll override the options with this as a combined object
         * @returns The built request instance
         */
        public connect(url: string, options?: Matsuwa.http.HttpRequestOptions): Matsuwa.http.HttpRequest;
      }
    }

    export namespace Types {
      export interface Configuration {
        /**
         * Any disabled plugins
         */
        disabledPlugins: string[];
    
        /**
         * Any disabled skins
         */
        disabledSkins: string[];
      
        /**
         * If Kashima should notify the user of a new update or a song is playing
         */
        notifications: boolean;
      
        /**
         * The directories to find audio files from
         */
        directories: string[];
      
        /**
         * Playlists created by the user
         */
        playlists: {
          name: string;
          songs: SongInfo[];
        }[];
      
        /**
         * The saved username to login automatically
         */
        username: string | null;
      
        /**
         * The saved password to login automatically
         */
        password: string | null;
    
        /**
         * A list of songs that were added when the application launches
         */
        songs: string[];
      
        /**
         * If Kashima should enable Discord RPC
         */
        rpc: boolean;
      }
    
      /**
       * The plugin information for any scripting for Kashima
       */
      export interface PluginInfo {
        /**
         * The plugin's description
         */
        description?: string;
    
        /**
         * If we should compile from TypeScript to JavaScript
         */
        typescript?: boolean;
    
        /**
         * The plugin's repository (must be `github.com` or `gitlab.com`)
         */
        repository?: string;
    
        /**
         * The main file (extensions avaliable: `.ts` or `.js`)
         */
        mainFile: string;
    
        /**
         * The version of the plugin
         */
        version?: string;
    
        /**
         * The name of the plugin
         */
        name: string;
    
        /**
         * The plugin's ID represented as a Java package import
         * @example
         * 'dev.august.myplugin'
         * or
         * 'august.myplugin'
         */
        id: string;
      }
    
      /**
       * The skin's information
       */
      export interface SkinInfo {
        /**
         * The pre-processor to use to compile the skin
         */
        preprocessor?: 'css' | 'sass' | 'less' | 'stylus';
    
        /**
         * The skin's description
         */
        description?: string;
    
        /**
         * The skin's repository (must be `github.com` or `gitlab.com`)
         */
        repository?: string;
    
        /**
         * The main file
         */
        mainFile: string;
    
        /**
         * The version of the skin
         */
        version?: string;
    
        /**
         * The name of the skin
         */
        name: string;
    
        /**
         * The skin's ID represented as a Java package import
         * @example
         * 'dev.august.myskin'
         * or
         * 'august.myskin'
         */
        id: string;
      }
    }

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

    interface BuildInfo {
      /**
       * The commit hash from the repository
       */
      commitHash: string;

      /**
       * The current version of Kashima
       */
      version: string;

      /**
       * The environment to use for Node.js
       */
      nodeEnv: 'development' | 'production';

      /**
       * The update channel the user is using
       * 
       * - edge: **Cutting Edge Builds (not stable)**
       * - nightly: **Updated frequently**
       * - stable: **Stablized version**
       */
      mode: 'edge' | 'nightly' | 'stable';
    }

    interface SongInfo {
      /**
       * The end duration
       */
      duration: number;
    
      /**
       * The artist of the song
       */
      artist: string;
    
      /**
       * The title of the song
       */
      title: string;
    
      /**
       * The album of the song
       */
      album: string;
    }

    class ConfigManager {
      /**
       * Gets a section from the config.json file,
       * all object-type configuration is nested with a `.`
       * to recursive the config until it finds something
       * 
       * @param section The section to find, use `.` to find something in an object
       * @returns The value found or `null` if it was not found
       */
      get<T>(section: string): T | null;

      /**
       * Gets a section from the config.json file,
       * all object-type configuration is nested with a `.`
       * to recursive the config until it finds something
       * 
       * @param section The section to find, use `.` to find something in an object
       * @param defaultValue The default value if the variable was not found
       * @returns The default value or `null` if no `defaultValue` was specified
       */
      get<T>(section: string, defaultValue: T): T;
      get<T>(section: string, defaultValue?: T): T | null;

      /**
       * Sets anything to the config.json file
       * and saves it in realtime. For nested
       * object-type configs, use a `.` to
       * recursive the config until it finds
       * something.
       * 
       * @param section The section to find, use `.` to nest over an Object
       * @param value The value to set
       */
      set(section: string, value: any): void;
    }

    class Updatable {
      private http: http.HttpClient;
      public type: 'plugin' | 'skin';
      public app: Application;
      public id: string;
      public folders: { [x: string]: string };
      public inject(app: Application): this;
      public canUpdate(): boolean;
      public update(force?: boolean): Promise<void>;
    }

    class InternalPlugin extends Updatable {
      /**
       * The plugin's information from it's manifest file
       */
      public info: Types.PluginInfo;

      /**
       * The base plugin to mount/unmount it
       */
      public base: Plugin;
    }

    class Skin extends Updatable {
      /**
       * If the skin was applied
       */
      public applied: boolean;

      /**
       * The skin's information from it's manifest file
       */
      public info: Types.SkinInfo;

      /**
       * Applies the skin to the application
       */
      public apply(): Promise<void>;

      /**
       * Unapply the skin itself
       */
      public eject(): void;
    }

    /**
     * Representation of a Toast that will pop up when `ToastAPI#append` is called
     */
    interface Toast {
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

    class ToastAPI {
      /**
       * Static object of all toasts that are on display
       */
      private toasts: { [x: string]: Toast; };

      /**
       * Static object for "toasts to close" intervals
       */
      private intervals: { [x: string]: NodeJS.Timeout; };

      /**
       * Opens a new instance of a Toast
       * @param toast The toast to open
       */
      append(toast: Toast): void;

      /**
       * Cloases a toast and removes the DOM element
       * @param name The toast name to remove
       */
      close(name: string): Promise<void>;
    }

    class Application extends EventDispatcher {
      /**
       * The settings from the config file
       */
      public settings: ConfigManager;

      /**
       * The plugin's manager to load the plugins
       */
      public plugins: PluginManager;

      /**
       * The toasts API to apply toasts
       */
      public toasts: ToastAPI;

      /**
       * The window itself
       */
      public window: Electron.BrowserWindow | null;

      /**
       * The build information from the `build.json` file
       */
      public build: Matsuwa.BuildInfo;

      /**
       * The skin's manager to apply/eject it
       */
      public skins: SkinManager;

      /**
       * The tray itself
       */
      public tray: Electron.Tray | null;

      /**
       * The RPC instance
       */
      public rpc: Ichigo;

      /**
       * Loads the window
       */
      public loadWindow(): Electron.BrowserWindow;
    }

    class PluginManager extends Collection<InternalPlugin> {
      /**
       * The plugin's directory path
       */
      public directory: string;

      /**
       * Loads the plugins
       */
      public start(): Promise<void>;
    }

    class SkinManager extends Collection<Skin> {
      /**
       * The skin's directory path
       */
      public directory: string;

      /**
       * Loads the skins
       */
      public start(): Promise<void>;
    }
  }

  // @ts-ignore
  global {
    /**
     * The global Kashima instance, used for the React components
     * or the Scripts API
     */
    var kashima: Matsuwa.Application;

    /** Log anything */
    var log: (level: 'info' | 'error' | 'warn' | 'debug', ...message: (string | object)[]) => void;
  }

  export = Matsuwa;
}