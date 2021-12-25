<template>
  <div class='features'>
    <table class='table is-striped'>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Kashima</th>
          <th>MusicBee</th>
          <th>foobar2000</th>
        </tr>
      </thead>
      <tbody>
        <template v-for='item in this.features'>
          <tr :key='item.title'>
            <th>{{ item.title }}</th>
            <template v-for='value in item.values'>
              <td :key='value'>
                <b-icon class='greenish' pack='fas' icon='check' v-if='value === true' />
                <b-icon class='reddish' pack='fas' icon='times-circle' v-if='value === false' />
              </td>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

/** Interface of structuring the `data` in this component */
interface Feature {
  /**
   * The values of the feature
   * 
   * **Indexed**
   * - Kashima
   * - MusicBee
   * - foobar2000
   */
  values: [boolean, boolean, boolean];

  /** The title of the feature */
  title: string;
}

@Component({
  name: 'Features',
  data(): { features: Feature[] } {
    return {
      features: [
        {
          title: 'Clean Audio',
          values: [true, true, false]
        },
        {
          title: 'Audio Manipulation',
          values: [true, false, false]
        },
        {
          title: 'Supports All Formats',
          values: [true, true, true]
        },
        {
          title: 'Cross-platform',
          values: [true, false, false]
        },
        {
          title: 'Full Customizability',
          values: [true, false, false]
        }
      ]
    };
  }
})
export default class FeaturesComponent extends Vue {}
</script>
<style lang='scss'>
$green: #8BDF95;
$red: #FA0F4F;

.greenish {
  color: $green;
}

.reddish {
  color: $red;
}
</style>