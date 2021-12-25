<template>
  <div id='app' v-if='hasLoginPath'>
    <router-view />
  </div>
  <div id='app' v-else>
    <Navbar />
    <router-view />
    <Footer />
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';

@Component({
  name: 'Application',
  components: {
    Navbar,
    Footer
  },
  computed: {
    hasLoginPath() {
      return this.$route.path === '/login' || this.$route.path === '/signup';
    }
  }
})
export default class ApplicationComponent extends Vue {}
</script>
<style lang='scss'>
@import 'assets/main';
</style>