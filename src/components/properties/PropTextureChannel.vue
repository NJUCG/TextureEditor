<template>
  <div class="field">
    <label>Texture Channel</label>
    <div :key="key">
      <select class="enum" @change="updateValue">
        <option
            v-for="(opt, index) in channelNames"
            :value="index"
            :key="index"
            :selected="index == channelIndex"
        >{{ opt }}</option
        >
      </select>
    </div>
  </div>
</template>


<script lang="ts">

import {Vue} from "vue-class-component";


export default class TextureChannelPropertyView extends Vue {
  channelNames = [
    "none",
    "albedo",
    "normal",
    "metalness",
    "roughness",
    "height",
    "emission",
    "ao",
    "alpha"
  ];
  channelIndex: number = 0;
  key: number = 0;


  mounted() {
    this.calculateChannelIndex();
  }

  calculateChannelIndex() {
    this.channelIndex = 0;

  }

  updateValue(evt) {

  }
}
</script>

<style scoped>
.field {
  font-size: 12px;
  padding: 0.9em 0.5em;
  color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px rgb(61, 61, 61) solid;
}

.field label {
  font-weight: bold;
  padding: 0.4em;
  padding-left: 0;
}

.enum {
  outline: 0;
  box-shadow: none;
  border: 0 !important;

  margin-top: 0.4em;
  width: 100%;
  border: none;
  border-radius: 4px;
  color: white;
  background: #222;
  padding: 0.5em;
  font-family: "Open Sans";
}
</style>

