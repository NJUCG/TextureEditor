<template>
  <div class="field">
    <label>{{ prop.displayName }}</label>
    <div>
      <select class="enum" @change="updateValue" ref="selectEnum">
        <option
            v-for="(opt, index) in prop.values"
            :value="index"
            :key="index"
            :selected="index == enumIndex"
        >{{ opt }}</option
        >
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">

import {defineProps, onMounted, ref} from 'vue'
let enumIndex=ref(0);
const props=defineProps(
    {
      prop:Object
    }
);
onMounted(() => {
  enumIndex.value=props.prop.index;
})
const updateValue=(evt)=> {
    console.log("修改index为"+evt.target.options.selectedIndex);
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
