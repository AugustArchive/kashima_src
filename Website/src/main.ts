import './middleware/fontawesome';
import './registerServiceWorker';
import Router from './router';
import Buefy from 'buefy';
import Store from './store';
import axios from 'axios';
import App from './App.vue';
import Vue from 'vue';

Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(Buefy, {
  defaultIconComponent: 'vue-fontawesome',
  defaultIconPack: 'fas'
});

new Vue({
  router: Router,
  render: handle => handle(App),
  store: Store
}).$mount('#app');