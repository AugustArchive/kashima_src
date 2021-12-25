// Custom shims for Vue  
import axios from 'axios';
import Vue from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $http: typeof axios;
  }
}