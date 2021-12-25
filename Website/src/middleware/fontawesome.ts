import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import * as fab from '@fortawesome/free-brands-svg-icons';
import * as fas from '@fortawesome/free-solid-svg-icons';
import Vue from 'vue';

library.add(
  // Solid
  fas.faSignInAlt,
  fas.faSignOutAlt,
  fas.faCogs,
  fas.faUserCircle,
  fas.faMusic,
  fas.faPaintRoller,
  fas.faLock,
  fas.faEnvelope,
  fas.faExclamationCircle,
  fas.faBookmark,
  fas.faPencilAlt,
  fas.faPaintBrush,
  fas.faHeart,
  fas.faCheck,
  fas.faTimesCircle,
  fas.faDownload,

  // Brand
  fab.faGithub,
  fab.faDiscord
);

Vue.component('vue-fontawesome', FontAwesomeIcon);