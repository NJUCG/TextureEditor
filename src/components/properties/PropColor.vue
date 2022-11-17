<template>
  <label>{{ prop.displayName }}</label>
  <ElColorPicker
      v-model="value1"
      @change="changeValue"
  >
  </ElColorPicker>
</template>


<script setup>
import {defineProps, onMounted, ref} from "vue";
let value1=ref("#111111");
const props=defineProps(
    {
      prop:Object
    }
);

onMounted(() => {
  value1.value=props.prop.value.toHex();
})
const changeValue=(evt)=>{
  console.log("颜色改变"+evt.toLowerCase());
}
</script>


<style>
</style>
