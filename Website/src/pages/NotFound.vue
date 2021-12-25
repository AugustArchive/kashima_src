<template>
  <section class='hero is-primary is-fullheight'>
    <div class='hero-body'>
      <div class='container'>
        <h1 class='title'>404 | Not Found</h1>
        <h2 class='subtitle'>
          Oh no! You found a URL that wasn't found, click the button below to go to the main page!
        </h2>
        <b-button type='is-grey' @click='redirect()'>Redirect me back!</b-button>
      </div>
    </div>
  </section>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'NotFound',
  computed: {
    redirect() {
      this.$router.push('/');
    }
  }
})
export default class NotFoundComponent extends Vue {}
</script>