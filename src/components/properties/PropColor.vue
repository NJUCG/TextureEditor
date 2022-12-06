<template>
  <div class="field">
  <div>
    <label>{{ prop.displayName }}</label>
  </div>
  <ElColorPicker
      v-model="value1"
      @change="changeValue"
  >
  </ElColorPicker>
  </div>
</template>


<script setup>
import {defineProps, onMounted, ref} from "vue";
import {Color} from "@/lib/designer/color";
import {useMainStore} from "@/store";
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

  let color=Color.parse(value1.value.toLowerCase());
  const store=useMainStore();
  store.changeProperties(props.prop.name,color);
  console.log("颜色改变"+evt.toLowerCase());

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


</style>
