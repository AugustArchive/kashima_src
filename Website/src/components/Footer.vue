<!-- Credit: -->
<template>
  <footer class='footer'>
    <div class='containter'>
      <div class='contents'>
        <div class='columns'>
          <div class='column'>
            <p>
              Join {{ this.users }} today!
            </p>
            <p>
              Copyright &copy; 2018-{{ this.current }} LiquidBlast
            </p>
            <p>
              Website was made with <b-icon icon='heart' size='is-small' /> with <a class='linko-vue' href='https://vuejs.org'>Vue</a> and <a class='linko-bulma' href='https://bulma.io'>Bulma</a>
            </p>
            <p>
              <small>Kashima is released under a custom license. Use the source code with caution.</small>
            </p>
          </div>
          <div class='column'>
            <router-link class='linko' to='/troubleshooting'>Troubleshooting</router-link><br />
            <router-link class='linko' to='/marketplace'>Marketplace</router-link><br />
            <router-link class='linko' to='/about'>About</router-link><br />
            <router-link class='linko' to='/team'>Team</router-link><br />
            <router-link class='linko' to='/'>Home</router-link><br />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
<script lang='ts'>
import { Component } from 'vue-property-decorator';
import Vue from 'vue';

@Component({
  name: 'Footer',
  data() {
    return {
      current: new Date().getFullYear(),
      users: ''
    };
  },
  async created() {
    const res = await this.$http.get('https://api.kashima.app/stats');
    const accounts = res.data.hasOwnProperty('message') ? 0 : res.data.data.accounts;

    (this as any).users = `${accounts} user${accounts > 1 ? 's' : ''}`;
  }
})
export default class Homepage extends Vue {}
</script>
<style lang='scss' scoped>
$grey-not-darkest: #7E7E7E;
$vuejs: #42B883;
$bulma: #00D1B2;

.new-line {
  white-space: pre-wrap;
}

.linko {
  color: white;
}

.linko:hover {
  color: $grey-not-darkest;
}

.linko-vue {
  color: white;
}

.linko-vue:hover {
  color: $vuejs;
}

.linko-bulma {
  color: white;
}

.linko-bulma:hover {
  color: $bulma;
}
</style>