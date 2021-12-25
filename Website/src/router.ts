import Router, { RouteConfig } from 'vue-router';
import Store from './store';
import Vue from 'vue';

Vue.use(Router);

interface RouteOptions {
  title: string;
  auth: boolean;
}
const lazilyAdd = (id: string, path: string, component: string, options: RouteOptions): RouteConfig => ({
  component: () => import(`./pages/${component}`),
  path,
  name: id,
  meta: {
    title: options.title,
    auth: options.auth
  }
});

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // Normal
    lazilyAdd('main', '/', 'Homepage', {
      title: 'Music Player',
      auth: false
    }),

    lazilyAdd('404', '*', 'NotFound', {
      title: 'Not Found',
      auth: false
    }),

    // Login/Signup
    lazilyAdd('login', '/login', 'Login', {
      title: 'Login',
      auth: false
    }),

    lazilyAdd('signup', '/signup', 'Signup', {
      title: 'Signup',
      auth: false
    }),
    
    // Marketplace-related
    lazilyAdd('marketplace', '/marketplace', 'Marketplace', {
      title: 'Marketplace',
      auth: false
    }),

    lazilyAdd('skin:marketplace', '/marketplace/:id', 'marketplace/Theme', {
      title: 'Theme Marketplace',
      auth: false
    }),

    // Miscellaneous
    lazilyAdd('about', '/about', 'About', {
      title: 'About',
      auth: false
    }),

    lazilyAdd('team', '/team', 'Team', {
      title: 'Team Members',
      auth: false
    }),

    // User-stuff
    lazilyAdd('selfuser', '/self', 'SelfPage', {
      title: 'Userpage',
      auth: true
    }),

    lazilyAdd('account', '/users/:username', 'Userpage', {
      title: 'User %username%',
      auth: false
    }),

    lazilyAdd('following', '/users/:username/following', 'profiles/Following', {
      title: '%username% is following',
      auth: false
    }),

    lazilyAdd('followers', '/users/:username/followers', 'profiles/Followers', {
      title: '%username%\'s Followers',
      auth: false
    }),

    lazilyAdd('friends', '/users/:username/friends', 'profiles/Friends', {
      title: '%username%\'s Friends',
      auth: false
    }),

    lazilyAdd('user:settings', '/self/settings', 'settings/UserSettings', {
      title: 'Settings',
      auth: true
    })
  ],
  scrollBehavior(to) {
    if (to.hash) return { selector: to.hash };
  }
});

router.beforeEach((to, _, next) => {
  if (to.matched.some(x => x.meta.auth)) {
    if (Store.getters.isLoggedIn) return next();
    else next('/login');
  } else {
    return next();
  }
});

// Credit: https://github.com/buefy/buefy/blob/dev/docs/router/guards.js
router.afterEach((to, _) => {
  const title = to.meta.path === '/' ? to.meta.title : `Kashima | ${to.meta.title}`;
  const uri = `https://kashima.app${to.meta.path}`;

  const updates = [
    { tag: 'meta[property="og:title"]', val: title },
    { tag: 'meta[property="og:url"]', val: uri },
    { tag: 'meta[name="twitter:title"]', val: title }
  ];

  window.document.documentElement.scrollTop = 0;
  window.document.title = title;

  for (const i of updates) {
    if (!i.val) continue;
    
    const item = document.head.querySelector(i.tag);
    if (item === null) {
      const element = document.createElement('meta');
      const type = i.tag.slice(4, i.tag.length - 12);
      element.setAttribute(type, i.tag.slice(15, i.tag.length - 2));
      element.setAttribute('content', i.val);

      document.head.appendChild(element);
    } else {
      item.setAttribute('content', i.val);
    }
  }
});

export default router;