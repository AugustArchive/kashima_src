import { useEffect } from 'react';
import { remote } from 'electron';

/**
 * Gets the local storage bucket
 * @returns {LocalStorageBucket | null} The bucket instance or null if not found
 */
export default function withLocal() {
  const bucket = localStorage.getItem('user');
  const actual = JSON.parse(bucket);

  /** @type {import('../../src/lib/Application').Application} */
  const app = remote.getGlobal('kashima');

  /** @type {import('../../src/@types/_normal').LogFunc} */
  const log = remote.getGlobal('log');

  useEffect(async() => {
    if (bucket !== null && bucket.isLoggedIn) {
      const res = await app
        .http
        .request({ 
          method: 'post',
          url: `https://api.kashima.app/accounts/${actual.username}` ,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bucket.token}`
          }
        }).execute();

      const data = res.json();
      if (data.statusCode > 200 && data.message) {
        log('warn', 'Unable to set the user\'s status to online!');
        return;
      } else {
        log('info', 'Set the user\'s status to online!');
        app.addJob('set-offline', async() => {
          const res = await app
            .http
            .request({
              method: 'post',
              url: `https://api.kashima.app/accounts/${actual.username}`,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${bucket.token}`
              },
              data: {
                set: {
                  'status': 'offline'
                }
              }
            }).execute();

          const data = res.json();
          if (data.statusCode > 200 && data.message) {
            log('warn', `API callback for Job 'set-offline': ${data.messsage}`);
          } else {
            log('info', 'User has been set to offline, goodbye!');
          }
        });
      }
    }
  });

  return actual;
}

/**
 * @typedef {object} LocalStorageBucket The local storage bucket
 * @prop {boolean} isLoggedIn If the user is logged in
 * @prop {string | null} token The user's token to modify data
 * @prop {User | null} user The user data
 * @prop {PlayingSong | null} song The current song they are playing
 * 
 * @typedef {object} User The user data from the API
 * @prop {string[]} blockedUsers The blocked users
 * @prop {UserPerms} permissions 
 */

/*
export interface User {
  blockedUsers: string[];
  permissions: {
    allowed: number;
    denied: number;
  };
  connections: {
    gravatar: string | null;
  };
  description: string;
  following: Friend[];
  followers: Friend[];
  avatarUrl: string;
  username: string;
  disabled: boolean;
  password: string; // NOT USED
  friends: Friend[];
  status: {
    current: 'online' | 'offline' | 'listening';
    song: string | null;
  };
  badges: string[];
  token: string;
  jwt: string | null;
}

export type ActionType = '$setUser' | '$setToken' | '$login';

interface Friend {
  avatarUrl: string;
  username: string;
  status: { current: 'offline' | 'online' | 'listening'; song: string | null; }
}

interface PlayingSong { 
  filepath: string;
  current: number;
}
*/