import { homedir } from 'os';
import { sep } from 'path';

const pkg = require('../../package.json');

/** RPC namespace for Discord's RPC */
// eslint-disable-next-line
export namespace RPC {
  // Imported from: https://github.com/auguwu/ichigo/blob/master/src/Ichigo.ts#L10-L104
  /** Interface for the activities itself */
  export interface Options {
    /**
     * The state of the RPC being used
     * 
     * **NOTE**: The state is on the bottom of the text
     */
    state?: string;

    /**
     * The details of the RPC being used
     * 
     * **NOTE**: The details is on the top of the text
     */
    details?: string;

    /**
     * If the RPC is an instance of something
     */
    instance?: boolean;

    /**
     * Timestamps object, to check on the `Elapsed`/`Ends At` text of the RPC
     */
    timestamps?: {
      /**
       * The start of the timestamp
       */
      start?: number;

      /**
       * The end of the timestamp
       */
      end?: number;
    }

    /**
     * Any assets to use when a user is using the RPC
     */
    assets?: {
      /**
       * The image key to use
       */
      large_image?: string;

      /**
       * The text when the large image is hovered
       */
      large_text?: string;

      /**
       * The small image key
       */
      small_image?: string;

      /**
       * The text when the small image key is hovered
       */
      small_text?: string;
    }

    /**
     * The party object, the ability to join/spectate on games
     */
    party?: {
      /**
       * The ID of the party
       */
      id?: any;

      /**
       * The size of the party
       */
      size?: number[];
    }

    /**
     * Any secret keys to use when a user joins/spectates/matches on a game
     */
    secrets?: {
      /**
       * The join key, when a user can join the game
       */
      join?: string;

      /**
       * The spectate key, when a user can spectate on a user during a match
       */
      spectate?: string;

      /**
       * The match key, when a user can join the other user's match
       */
      match?: string;
    }
  }

  export type Status = 'MainMenu' | 'Playing' | 'Store' | 'PluginStore' | 'SkinStore' | 'Plugin' | 'Skin';

  /** Statuses used for RPC */
  export const Statuses = {
    MainMenu: ({
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (Prototype)`
      },
      instance: false,
      details: 'Main Menu',
      state: 'Browsing libraries...'
    } as RPC.Options),
    Playing: (info: Types.SongInfo) => {
      const album = info.album ? ` (${info.album})` : '';
      return ({
        timestamps: {
          start: new Date().getTime(),
          end: new Date().getTime() + info.duration
        },
        assets: {
          large_image: 'kashima',
          large_text: `📣 Using v${pkg.version} (Prototype)`
        },
        instance: false,
        details: `🎵 ${info.artist} - ${info.title}${album}`
      } as RPC.Options);
    },
    Store: {
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (Prototype)`
      },
      instance: false,
      details: 'Browsing Stores...'
    },
    PluginStore: {
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (Prototype)`
      },
      instance: false,
      details: 'Browsing all plugins...'
    },
    SkinStore: {
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (Prototype)`
      },
      instance: false,
      details: 'Browsing all skins...'
    },
    Plugin: (plugin: Types.PluginInfo) => ({
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (Prototype)`
      },
      instance: false,
      details: `Viewing plugin ${plugin.name} (${plugin.id})`
    }),
    Skin: (skin: Types.SkinInfo) => ({
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (Prototype)`
      },
      instance: false,
      details: `Viewing skin ${skin.name} (${skin.id})`
    })
  };
}

/** Type definitions list */
// eslint-disable-next-line
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
     * The saved volume
     */
    volume: number;

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

  export interface SongInfo {
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
}

export const DefaultSettings: Types.Configuration = {
  disabledPlugins: [],
  disabledSkins: [],
  notifications: false,
  directories: [`${homedir()}${sep}Music`],
  playlists: [],
  username: null,
  password: null,
  volume: 50,
  songs: [],
  rpc: true
};