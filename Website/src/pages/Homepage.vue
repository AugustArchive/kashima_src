<template>
  <div class='main'>
    <section>
      <b-sidebar :fullheight='true' :right='true' type='is-light'>
        <template v-if='this.user.friends.length'>
          <div class='pad'>
            <h1 class='title'>Friend Activity</h1>
          </div>
          <b-menu>
            <b-menu-list>
              <b-menu-item v-for='friend in this.user.friends.slice(0, 10)' :key='friend.username'>
                <div class='container'>
                  <div class='columns is-centered'>
                    <div class='column is-3'>
                      <figure class='image is-48x48'>
                        <img :src='friend.avatarUrl' class='round' />
                      </figure>
                    </div>
                    <div class='column is-6'>
                      <span>{{friend.username}}</span>
                      <span v-if='friend.status.current === "listening"' class='bottom'>
                        {{friend.status.song}}
                      </span>
                    </div>
                  </div>
                </div>
              </b-menu-item>
            </b-menu-list>
          </b-menu>
        </template>
        <template v-else>
          <div class='pad'>
            <h1 class='title'>Oh no, you don't have any friends you sick fuck</h1>
          </div>
        </template>
      </b-sidebar>
    </section>
    <template v-if='!!this.user'>
      <section class='hero is-primary'>
        <div class='hero-body'>
          <div class='container'>
            <h1 class='title'>Welcome back, {{ user.username }}</h1>
          </div>
        </div>
      </section>
      <template v-if='this.news.length'>
        <section v-for='article in this.news.slice(0, 10)' class='hero' :key='article.uuid'>
          <div class='container'>
            <h1 class='title'>{{ article.title }} (made by {{ article.author }} | {{ toHumanize(article.createdAt) }})</h1>
            <b-button type='is-grey' icon-pack='fas' icon-left='download' @click='toArticle(article.uuid)'>View here...</b-button>
          </div>
        </section>
      </template>
      <template v-else>
        <section class='hero pad-bot'>
          <h1 class='title'>No news for today, what a bummer...</h1>
        </section>
      </template>
    </template>
    <template v-else>
      <section class='hero is-primary is-fullheight'>
        <div class='hero-body'>
          <div class='container'>
            <h1 class='title'>Kashima</h1>
            <h2 class='subtitle'>Kashima is a modernized music player made for the modern world.</h2>
          </div>
        </div>
      </section>
      <section class='hero'>
        <div class='hero-body'>
          <div class='container'>
            <div class='columns'>
              <div class='column has-text-centered'>
                <b-icon pack='fab' icon='github' size='is-large' />
                <p class='feature-title'>Free / Open Source</p>
                <p class='feature-body'>
                  All platforms of Kashima is open sourced on GitHub.
                </p>
              </div>
              <div class='column has-text-centered'>
                <b-icon pack='fas' icon='music' size='is-large' />
                <p class='feature-title'>No Lagback</p>
                <p class='feature-body'>
                  You host your own music, so you get the best quality instead of listening to scruffy music!
                </p>
              </div>
              <div class='column has-text-centered'>
                <b-icon pack='fas' icon='paint-roller' size='is-large' />
                <p class='feature-title'>Customizable</p>
                <p class='feature-body'>
                  Create your own plugins and themes and release them to the world!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <hr />
      <section class='hero'>
        <div class='hero-body has-text-centered'>
          <div class='container'>
            <h1 class='title'>Comparisions</h1>
            <center>
              <Features />
            </center>
          </div>
        </div>
      </section>
      <hr />
      <section class='hero'>
        <div class='hero-body has-text-centered'>
          <div class='container'>
            <h1 class='title'>Sounds good for you?</h1>
            <h2 class='subtitle'>Give it a test drive and see if you like it!</h2>
            <b-button type='is-grey' icon-pack='fas' icon-left='download' @click='downloadPage()'>Download here</b-button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Features from '@/components/Features.vue';

@Component({
  name: 'Homepage',
  computed: {
    downloadPage() {
      return this.$router.push('/download');
    }
  },
  components: {
    Features
  },
  data() {
    return {
      news: [],
      user: this.$store.state.user
    };
  },
  async mounted() {
    const res = await fetch('https://api.kashima.app/news');
    const data = await res.json();

    (this as any).news = data.data;
  },
  methods: {
    toHumanize(date: number) {
      const time = new Date(date);
      return `${time.getDate()}/${time.getMonth() - 1}/${time.getFullYear()} at ${`0${time.getHours()}`.slice(-2)}:${`0${time.getMinutes()}`.slice(-2)}:${`0${time.getSeconds()}`.slice(-2)}`;
    }
  }
})
export default class Homepage extends Vue {}
</script>
<style lang='scss' scoped>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@500&display=swap');

$size: 16px;

.feature-title {
  font-weight: bold;
  font-size: $size;
}

.feature-body {
  font-size: $size;
}

.pad {
  padding: 1em;

  h1.title {
    font-family: 'Ubuntu', sans-serif;
  }
}

.bottom {
  padding-top: 15px;
}

.pad-bot {
  padding-bottom: 25px;
  padding-top: 25px;
}
</style>