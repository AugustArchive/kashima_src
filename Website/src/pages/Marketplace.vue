<template>
  <div class='marketplace'>
    <section class='hero is-primary is-medium'>
      <div class='hero-body'>
        <div class='container'>
          <h1 class='title'>Marketplace</h1>
          <h2 class='subtitle'>
            Plugins and Themes made for the Desktop app!
          </h2>
          <b-button icon-left='bookmark' type='is-grey' @click='publish()'>Publish your own plugin or theme!</b-button>
        </div>
      </div>
    </section>
    <div class='container'>
      <br />
      <br />
      <h1 class='t-title'><b-icon pack='fas' icon='pencil-alt' /> Plugins</h1>
      <h2 class='t-subtitle'>{{ !this.plugins.length ? 'There is nothing avaliable, will you publish one?' : `View ${this.plugins.length} amount of plugins to choose from.` }}</h2>
      <br />
      <div v-if='this.plugins.length > 1' class='columns is-centered'>
        <div v-for='item in this.plugins.slice(0, 5)' :key='item.id' class='column is-5-tablet is-4-desktop is-3-widescreen'>
          <div class='card'>
            <div class='card-content'>
              <div class='media'>
                <div class='media-content'>
                  <p class='title is-4'>{{ item.name }}</p>
                </div>
              </div>
              <div class='content'>
                {{ item.description }}
              </div>
            </div>
            <footer class='footer'>
              <router-link :to="{ name: 'plugin:preview', params: { id: item.id } }">View</router-link>
              <router-link v-if='this.user.username === item.author' :to="{ name: 'plugin:edit', params: { id: item.id } }">Edit</router-link>
            </footer>
          </div>
        </div>
      </div>
      <br />
      <br />
      <h1 class='t-title'><b-icon pack='fas' icon='paint-brush' /> Themes</h1>
      <h2 class='t-subtitle'>{{ !this.skins.length ? 'There is nothing avaliable, will you publish one?' : `View ${this.skins.length} amount of themes to choose from.` }}</h2>
      <br />
      <div v-if='this.skins.length > 1' class='columns is-centered'>
        <div v-for='item in this.skins.slice(0, 5)' :key='item.id' class='column is-5-tablet is-4-desktop is-3-widescreen'>
          <div class='card'>
            <div class='card-content'>
              <div class='media'>
                <div class='media-content'>
                  <p class='title is-4'>{{ item.name }}</p>
                </div>
              </div>
              <div class='content'>
                {{ item.description }}
              </div>
            </div>
            <footer class='footer'>
              <router-link :to="{ name: 'skin:preview', params: { id: item.id } }">View</router-link>
              <router-link v-if='this.user.username === item.author' :to="{ name: 'skin:edit', params: { id: item.id } }">Edit</router-link>
            </footer>
          </div>
        </div>
      </div>
    </div>
    <br />
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'Marketplace',
  data() {
    return {
      plugins: [],
      skins: []
    };
  },
  async mounted() {
    const [plugins, skins] = await Promise.all([
      this.$http.get('https://api.kashima.app/plugins'),
      this.$http.get('https://api.kashima.app/skins')
    ]);

    (this as any).plugins = plugins.data.data;
    (this as any).skins   = plugins.data.data;
  },
  computed: {
    publish() {
      this.$router.push('/publish');
    }
  }
})
export default class MarketplaceComponent extends Vue {}
</script>
<style lang='scss' scoped>
@import url('https://fonts.googleapis.com/css2?family=Baloo+Tammudu+2:wght@500&family=Muli:ital,wght@1,300&display=swap');

$title-size: 30px;
$subtitle-size: 16px;

.t-title {
  font-family: 'Baloo Tammudu 2', cursive;
  font-size: $title-size;
}

.t-subtitle {
  font-family: 'Muli', sans-serif;
  font-size: $subtitle-size;
}
</style>