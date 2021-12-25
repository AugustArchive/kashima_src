/* eslint-disable camelcase */
import { homedir } from 'os';
import { join } from 'path';

const pkg = require('../../package.json');
const build = (<string> (require('../build.json')).type).split('').map(x => 
  `${x.charAt(0).toUpperCase()}${x.slice(1)}`  
).join('');


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
        large_text: `📣 Using v${pkg.version} (${build})`
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
          large_text: `📣 Using v${pkg.version} (${build})`
        },
        instance: false,
        details: `🎵 ${info.artist} - ${info.title}${album}`
      } as RPC.Options);
    },
    Marketplace: {
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (${build})`
      },
      instance: false,
      details: 'Browsing the marketplace...'
    },
    Theme: (theme: Types.ThemeInfo) => ({
      timestamps: {
        start: new Date().getTime()
      },
      assets: {
        large_image: 'kashima',
        large_text: `📣 Using v${pkg.version} (${build})`
      },
      instance: false,
      details: `Viewing theme "${theme.name}" (${theme.id})`
    })
  };
}

/** Type definitions list */
// eslint-disable-next-line
export namespace Types {
  export interface Configuration {
    /**
     * Any disabled themes
     */
    disabledThemes: string[];

    /**
     * A custom root directory (so we can set the app path to it)
     */
    rootDirectory: string;
  
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
     * The user's liked songs (categorized in a playlist)
     */
    liked: string[];
  
    /**
     * If Kashima should enable Discord RPC
     */
    rpc: boolean;
  }

  /**
   * The skin's information
   */
  export interface ThemeInfo {
    preprocessor: 'css' | 'sass';
    contributors?: (string | {
      email: string;
      name: string;
    })[];
    repository?: string;
    mainFile: string;
    author?: string;
    version: string;
    website: string;
    name: string;
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

  type Keys = 'kashima' | 'logger' | 'build';
  export const Inversify: { [x in Keys]: symbol } = {
    kashima: Symbol.for('$app'),
    logger: Symbol.for('$logger'),
    build: Symbol.for('$build')
  };
}

export const DefaultSettings: Types.Configuration = {
  disabledThemes: [],
  // this is for development (so it'll be `D:\\Projects\\Source\\Kashima`)
  rootDirectory: join(process.cwd(), '..', '..', 'Source', 'Kashima'),
  notifications: false,
  directories: [join(homedir(), 'Music')],
  playlists: [],
  username: null,
  password: null,
  volume: 50,
  liked: [],
  rpc: true
};