<template>
  <div id='following'>
    <h1 class='title'>{{ this.user.username }}'s Followers</h1>
    <p class='subtitle' v-if='!this.user.following.length'>
      {{ this.user.username }} doesn't have any people following.
    </p>
    <template v-else v-for='(item, index) in this.following'>
      <br :key='index' />
      <profile-card :key='item.username' :data='this.following[index]' />
      <hr :key='index' />
    </template>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import ProfileCard from '@/components/ProfileCard.vue';

@Component({
  name: 'user-following',
  components: {
    'profile-card': ProfileCard
  },
  data() {
    return {
      page: 0,
      user: this.$store.state.user
    };
  },
  computed: {
    total() { 
      return (this as any).items.length; 
    },

    paginate() {
      let page = (this as any).page - 1;
      return (this as any).items.slice(page * 10, (page + 1) * 10);
    }
  }
})
export default class UserFollowingComponent extends Vue {}
</script>
<style lang='scss'>
@import url(https://fonts.googleapis.com/css?family=Muli|Montserrat&display=swap);

#following {
  text-align: center;
}

.title {
  font-family: 'Muli', sans-serif;
}

.subtitle {
  padding-bottom: 15px;
  padding-top: 10px;
  font-family: 'Montserrat', sans-serif;
}
</style>