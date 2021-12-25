import Storage from 'vuex-persist';
import axios from 'axios';
import Vuex from 'vuex';
import Vue from 'vue';

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
  activated: boolean;
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
  email: string; // NOT USED
  salt: string; // NOT USED
  jwt: string | null;
}

interface Friend {
  avatarUrl: string;
  username: string;
  status: { current: 'offline' | 'online' | 'listening'; song: string | null; }
}

export interface StoreState {
  /** If the user is logged in */
  isLoggedIn: boolean;


  isDark: boolean;

  /**
   * The different store-type status
   * 
   * * `unknown` - The state was just made
   * * `loading` - Making an request to the API
   * * `success` - The request was a success
   * * `error`   - An error occured
   */
  status: 'unknown' | 'loading' | 'error' | 'success';

  /** The token to edit settings */
  token: string | null;

  /** The user data itself */
  user: User | null;
}

interface StatusRequest<T> {
  statusCode: number;
  message?: string;
  data?: T;
}

// TODO: Add email/password authenication
interface LoginData {
  username: string;
  password: string;
}

interface RegisterData extends LoginData {
  email: string;
}

Vue.use(Vuex);

const storage = new Storage<StoreState>();

export default new Vuex.Store<StoreState>({
  plugins: [storage.plugin],
  state: {
    isLoggedIn: false,
    isDark: true,
    status: 'unknown',
    token: null,
    user: null
  },
  mutations: {
    onAuthRequest(state) {
      state.status = 'loading';
    },

    onAuthSuccess(state, data: { token: string, user: User }) {
      state.isLoggedIn = true;
      state.status = 'success';
      state.token = data.token;
      state.user = data.user;
    },

    onAuthError(state) {
      state.status = 'error';
    },

    logout(state) {
      state.isLoggedIn = false;
      state.status = 'unknown';
      state.token = null;
      state.user = null;
    },

    updateDark(state, dark) {
      state.isDark = dark;
    }
  },
  actions: {
    login({ commit }, data: LoginData) {
      return new Promise((resolve, reject) => {
        commit('onAuthRequest');
        axios({
          url: 'http://localhost:6940/request', 
          method: 'post',
          headers: {
            'X-Requires-Auth': true
          },
          data: {
            route: '/accounts/login',
            method: 'post',
            data
          }
        }).then(res => {
          if (res.data.message) {
            commit('onAuthError');
            return reject(res.data.message);
          }

          const account = res.data.data!;
          axios.defaults.headers['Authorization'] = account.jwt;
          commit('onAuthSuccess', { token: account.jwt, user: account });

          resolve(account);
        }).catch(error => {
          commit('onAuthError');
          return reject(error);
        });
      });
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('logout');
        delete axios.defaults.headers.Authorization;
        resolve();
      }); 
    },
    register({ commit }, data: RegisterData) {
      return new Promise((resolve, reject) => {
        commit('onAuthRequest');
        axios({
          url: 'http://localhost:6940/request',
          method: 'post',
          headers: {
            'X-Requires-Auth': true
          },
          data: {
            route: '/accounts',
            method: 'put',
            data
          }
        }).then(res => {
          if (res.data.message) {
            commit('onAuthError');
            return reject(res.data.message);
          }

          const account = res.data.data!;
          axios.defaults.headers['Authorization'] = account.jwt;
          commit('onAuthSuccess', { token: account.jwt, user: account });

          resolve(account);
        }).catch(error => {
          commit('onAuthError');
          return reject(error);
        });
      });
    }
  },
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    user: (state) => state.user
  }
});