<template>
  <section class='hero is-primary is-fullheight'>
    <div class='hero-body'>
      <div class='container'>
        <div class='columns is-centered'>
          <div class='column is-5-tablet is-4-desktop is-3-widescreen'>
            <h1 class='title'>Login</h1>
            <form @submit.prevent='process' class='box'>
              <b-field label='Username'>
                <b-input type='text' v-model='username' placeholder='i.e. derpy69' />
              </b-field>
              <b-field label='Password' :type="{'is-danger': !!this.error}" :message="this.error">
                <b-input type='password' v-model='password' placeholder='...' />
              </b-field>
              <button type='submit' class='button is-primary login-btn'>Login</button>
            </form>
            <b-field grouped>
              <div class='control'>
                <b-button type='is-success' @click='signup()'>Don't have an account?</b-button>
              </div>
              <div class='control'>
                <b-button icon-pack='fab' icon-left='discord' type='is-discord' @click='loginWithDiscord()'>Sign in with Discord</b-button>
              </div>
            </b-field>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      error: null
    };
  },
  computed: {
    async process() {
      const button = document.querySelector<HTMLButtonElement>('.login-btn');
      button!.disabled = true;
      (this as any).isLoading = true;
      
      this.$store.dispatch('login', {
        username: (this as any).username,
        password: (this as any).password
      }).then(data => {
        this.$router.push('/');
      }).catch(e => {
        (this as any).error = e.request.response;
        button!.disabled = false;

        this.$buefy.toast.open({
          duration: 5000,
          message: `An error occured: ${e.response.data.message}`,
          position: 'is-bottom-right',
          type: 'is-danger'
        });
      });
    },
    loginWithDiscord() {
      this.$buefy.toast.open({
        duration: 5000,
        message: 'Discord login is coming soon!',
        position: 'is-bottom-right',
        type: 'is-discord'
      });
    },
    signup() {
      this.$router.push('/signup');
    }
  }
})
export default class LoginComponent extends Vue {}
</script>