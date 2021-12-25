<template>
  <b-navbar>
    <template slot='brand'>
      <b-navbar-item tag='router-link' :to="{ path: '/' }">
        <img src='https://cdn.kashima.app/logos/logo.png' alt='Logo' />
      </b-navbar-item>
    </template>
    <template slot='start'>
      <b-navbar-item tag='router-link' to='/'>Home</b-navbar-item>
      <b-navbar-item tag='router-link' to='/marketplace'>Marketplace</b-navbar-item>
      <b-navbar-item tag='router-link' to='/about'>About</b-navbar-item>
      <b-navbar-item tag='router-link' to='/team'>Team Members</b-navbar-item>
      <b-navbar-item v-if='isLoggedIn && this.user.badges.includes("admin")' tag='a' href='https://admin.kashima.app'>Admin Dashboard</b-navbar-item>
    </template>
    <template slot='end'>
      <b-navbar-dropdown right v-if='isLoggedIn' hoverable boxed :label="this.user.username">
        <b-navbar-item tag='router-link' to='/self'>
          <b-icon icon='user-circle' custom-size='mdi-18px' />
          <span>Profile</span>
        </b-navbar-item>
        <b-navbar-item tag='router-link' to='/self/settings'>
          <b-icon icon='cogs' custom-size='mdi-18px' />
          <span>Settings</span>
        </b-navbar-item>
        <hr class='navbar-divider' />
        <b-navbar-item v-on:click='logout()'>
          <b-icon icon='sign-out-alt' custom-size='mdi-18px' />
          <span>Logout</span>
        </b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-item v-else v-on:click='login()'>
        <b-icon icon='sign-in-alt' custom-size='mdi-18px' />
        <span>Login</span>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import Vuex from 'vuex';
import Vue from 'vue';

@Component({
  name: 'Homepage',
  data() {
    return {
      isDark: this.$store.state.isDark,
      user: this.$store.state.user
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.user !== null;
    }
  },
  methods: {
    login() {
      this.$router.push('/login');
    },
    logout() {
      this.$store.commit('logout');
      this.$router.push('/');
    },
    burger(event) {
      const type = event.target.closest('.navbar-burger');
      const target: any = this.$refs.navMenu;

      type.classList.toggle('is-active');
      target.classList.toggle('is-active');
    },
    dropdown() {
      const target: any = this.$refs.dropdown;
      target.classList.toggle('is-active');
    }
  }
})
export default class Homepage extends Vue {}
</script>
<!--
document.querySelectorAll('section.hero.is-primary');
-->
<style lang='scss' scoped>
.avatar {
  margin-right: 0.6rem;
}
</style>