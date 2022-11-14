<template>
  <p></p>
  <p></p>
  <p></p>
  <div class="field">
    <label>{{ prop.displayName }}</label>
    <label>TEST</label>
    <div>
      <button class="bool" @click="toggleValue()">
<!--        {{ val ? "True" : "False" }}-->
        {{val}}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
let val=ref(false);
import {defineProps, ref} from 'vue'
const props=defineProps(
        {
          prop:Object
        }
    );

const toggleValue = () => {
        val.value=!val.value;
        console.log("修改为"+val.value);
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

.bool {
  margin-top: 0.4em;
  width: 100%;
  border: none;
  border-radius: 2px;
  color: white;
  background: #222;
  padding: 4px;
  outline: none;
}
</style>
