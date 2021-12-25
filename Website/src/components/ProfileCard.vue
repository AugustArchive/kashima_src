<template>
  <div id='profile-card'>
    <div class='container'>
      <div class='columns is-centered'>
        <div class='column is-2'>
          <img draggable='false' :src='this.user.avatarURL' class='round' alt='Image' />
        </div>
        <div>

        </div>
      </div>
    </div>
  </div>
</template>
<!--
        <div class='container'>
          <div class='columns is-centered'>
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
-->
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'profile-card',
  props: {
    user: { type: Object }
  },
  data() {
    return {
      user: (this as any).user
    };
  }
})
export default class ProfileCardComponent extends Vue {}
</script>