
<template>
  <div class="field">
    <div>
      <label>{{ prop.displayName }}</label>
    </div>
    <div class="input-holder">
      <canvas @click="loadImage()" width="150" height="150" ref="canvas" />
      <div class="image-buttons">
        <button class="image-button load-button" @click="loadImage()">
          选择图片
        </button>
        <button class="image-button load-button" @click="toStore()">
          确认导入
        </button>
        <input type="file" name="filename" id="open" style="display:none" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {defineProps} from 'vue'
import {useMainStore} from "@/store";
const store=useMainStore();
const props=defineProps(
    {
      prop:Object
    }
);
const loadImage=()=>{
  document.getElementById('open').click();

}
const toStore=()=>{
  const doc=document.getElementById('open')as HTMLInputElement;
  console.log(doc.files[0].path);
  store.changeProperties(props.prop.name,doc.files[0].path);
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


.input-holder {
  display: flex;
}

.image-buttons {
  display: flex;
  flex-direction: column;
  margin-left: 5px;
}

.image-button {
  width: 48px;
  height: 48px;
  margin: 1px;
  box-sizing: border-box;
  background: #222;
  border: none;
  color: white;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;
}

.image-button:hover {
  background: rgb(88, 88, 88);
}
</style>