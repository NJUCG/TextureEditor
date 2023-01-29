<template>
  <div class="field">
    <div>
      <label>{{ prop.displayName }}</label>
    </div>
    <div class="input-holder">
      <div style="width:95%; margin-right:10px">
				<textarea
            v-if="prop.isMultiline"
            :value="prop.value"
            @blur="updateValue"
            style="width:100%"
            rows="5"
        ></textarea>
        <input
            v-if="!prop.isMultiline"
            type="text"
            :value="prop.value"
            @blur="updateValue"
            style="width:100%"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {defineProps, onMounted, ref} from 'vue'
import {useMainStore} from "@/store";
const store=useMainStore();
const props=defineProps(
    {
      prop:Object
    }
);
const updateValue=(evt)=>{
  console.log("修改值为"+evt.target.value);
  store.changeProperties(props.prop.name,evt.target.value);
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

.number {
  width: calc(100% - 4px - 1px);
  border: solid gray 1px;
  padding: 2px;
  border-radius: 2px;
}

.input-holder {
  display: flex;
}
</style>
