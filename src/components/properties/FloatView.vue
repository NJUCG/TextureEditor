<template>
  <div class="field">
    <div>
      <label>{{ prop.displayName }}</label>
    </div>
    <div class="input-holder">
      <div style="width:100%; margin-right:10px;padding:0.4em;">
        <input
            type="range"
            :min="prop.minValue"
            :max="prop.maxValue"
            :value="val"
            :step="prop.step"
            @input="updateRangeValue"
            class="slider"
            @mousedown="focus"
            @mouseup="blur"
        />
      </div>
      <div style="width:70px;">
        <input
            type="number"
            :value="val"
            :step="prop.step"
            @input="updateValue"
            class="number"
            @focus="focus"
            @blur="blur"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

let val=ref(0);
import {defineProps, onMounted, ref} from 'vue'
import {useMainStore} from "@/store";
const store=useMainStore();
const props=defineProps(
    {
      prop:Object
    }
);
onMounted(() => {
val.value=props.prop.value;
})
const blur=(evt)=> {
  console.log("更新值为"+val.value)
}
const updateValue=(evt) => {
  let newValue = evt.target.value;
  if (newValue == '') {
    console.log("什么也没做")
  } else {
    if (newValue <= props.prop.maxValue && newValue >= props.prop.minValue) {
      val.value = newValue;
      store.changeProperties(props.prop.name,val.value);
      console.log("更新值为" + val.value)
    } else if (newValue > props.prop.maxValue) {
      val.value = props.prop.maxValue;
      store.changeProperties(props.prop.name,val.value);
      console.log("更新值为" + val.value)
    } else {
      val.value = props.prop.minValue;
      store.changeProperties(props.prop.name,val.value);
      console.log("更新值为" + val.value)
    }
  }
}

const updateRangeValue=(evt) =>{
  val.value = evt.target.value;
  store.changeProperties(props.prop.name,val.value);
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
  width: calc(100% - 1em - 1px);
  border: solid transparent 1px;
  border-radius: 4px;
  position: relative;
  outline: none;

  background: #4e4e4e;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.5em;
}

.number:focus {
  border-color: dodgerblue;
}

.number::-webkit-inner-spin-button {
  width: 1em;
  border-left: 1px solid #bbb;
  opacity: 1;
  color: rgb(130, 130, 130);
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
}

.input-holder {
  display: flex;
}

/* https://www.w3schools.com/howto/howto_js_rangeslider.asp */
/* http://jsfiddle.net/brenna/f4uq9edL/?utm_source=website&utm_medium=embed&utm_campaign=f4uq9edL */
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 3px;
  border-radius: 5px;
  background-color: rgb(255, 255, 255, 0.7);
  color: rgba(0, 0, 0);
  outline: none;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  /* background: #fff -webkit-linear-gradient(transparent, rgba(0, 0, 0, 0.05)); */
  background-color: rgb(51, 51, 51);
  border: solid white 2px;
  outline: solid rgb(51, 51, 51) 3px;
  cursor: pointer !important;
  /* box-shadow: 0 1px 2px 0 rgba(34, 36, 38, 0.15),
    0 0 0 1px rgba(34, 36, 38, 0.15) inset; */
}

.slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgb(51, 51, 51);
  border: solid white 2px;
  outline: solid rgb(51, 51, 51) 3px;
  cursor: pointer !important;
  box-shadow: 0 1px 2px 0 rgba(34, 36, 38, 0.15),
  0 0 0 1px rgba(34, 36, 38, 0.15) inset;
}

.slider::-ms-thumb {
  min-height: 20px;
  transform: scale(1) !important;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: rgb(51, 51, 51);
  border: solid white 2px;
  outline: solid rgb(51, 51, 51) 3px;
}

.slider::-ms-fill-lower {
  background: #777;
  border-radius: 10px;
}

.slider::-ms-fill-upper {
  background: #ddd;
  border-radius: 10px;
}

.texture-options {
  background: #e0e0e0;
  border-radius: 3px;
  margin-bottom: 1em !important;
  padding: 1em;
}
</style>
