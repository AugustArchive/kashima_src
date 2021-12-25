<template>
  <div class='selfpage'>
    <section class='hero is-primary is-medium'>
      <div class='hero-body'>
        <div class='container'>
          <div class='columns is-centered'>
            <div class='column is-2'>
              <img draggable='false' :src='this.user.avatarURL' class='round' alt='Image' />
            </div>
            <div class='column is-4'>
              <h1 class='title'>{{ this.user.username }}</h1>
              <h2 class='subtitle'>{{ this.user.description === '' ? 'No description was set.' : this.user.description }}</h2>
              <div class='level'>
                <div class='level-left'>
                  <b-button tag='router-link' :to='`users/${this.user.username}/followers`' type='is-grey' class='button social-button level-item'>Followers</b-button>
                  <b-button tag='router-link' :to='`users/${this.user.username}/following`' type='is-grey' class='button social-button level-item'>Following</b-button>
                  <b-button tag='router-link' :to='`users/${this.user.username}/friends`' type='is-grey' class='button social-button level-item'>Friends</b-button>
                </div>
              </div>
              <div v-if='this.user.badges.length' class='level'>
                <div class='level-left'>
                  <a class='button social-button level-item is-twitter non-click' v-if='this.user.badges.includes("admin")'>
                    Administrator
                  </a>
                  <a class='button social-button level-item is-grey non-click' v-if='this.user.badges.includes("author")'>
                    Plugin/Theme Author
                  </a>
                  <a class='button social-button level-item is-lb non-click' v-if='this.user.badges.includes("liquidblast")'>
                    LiquidBlast
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class='container'>
      <br />
      <br />
      <h1 class='t-title'><b-icon pack='fas' icon='pencil-alt' /> Plugins</h1>
      <h2 class='t-subtitle'>{{ !this.allPlugins.length ? `${this.user.username} has not published any plugins.` : `View ${this.allPlugins.length} amount of plugins to choose from.` }}</h2>
      <br />
      <div v-if='this.allPlugins.length > 1' class='columns is-centered'>
        <div v-for='item in this.allPlugins.slice(0, 5)' :key='item.id' class='column is-5-tablet is-4-desktop is-3-widescreen'>
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
            </footer>
          </div>
        </div>
      </div>
      <br />
      <br />
      <h1 class='t-title'><b-icon pack='fas' icon='paint-brush' /> Themes</h1>
      <h2 class='t-subtitle'>{{ !this.allThemes.length ? `${this.user.username} has not published any themes.` : `View ${this.allThemes.length} amount of themes to choose from.` }}</h2>
      <br />
      <div v-if='this.allThemes.length > 1' class='columns is-centered'>
        <div v-for='item in this.allThemes.slice(0, 5)' :key='item.id' class='column is-5-tablet is-4-desktop is-3-widescreen'>
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
            </footer>
          </div>
        </div>
      </div>
      <br />
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'SelfPage',
  data() {
    return {
      allPlugins: [],
      allThemes: [],
      user: this.$store.state.user
    };
  },
  async mounted() {
    const [themes, plugins] = await Promise.all([
      this.$http.get('https://api.kashima.app/skins'),
      this.$http.get('https://api.kashima.app/plugins')
    ]);

    const username = (this as any).user.username;
    (this as any).allPlugins = plugins.data.data.filter(x => x.owner === username || x.authors.includes(username));
    (this as any).allThemes  = themes.data.data.filter(x => x.owner === username || x.authors.includes(username));
  }
})
export default class SelfPageComponent extends Vue {}
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

.round {
  border-radius: 50%;
  height: 150px;
  width: 150px;
}
</style>