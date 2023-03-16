<template>
  <component
      v-for="(p, index) in this.prop"
      :is="p.componentName"
      :prop="p.prop"
      :key="index"
  ></component>
<!--  <div>{{properties}}</div>-->
  <div>propertyView</div>

</template>

<script  setup lang="ts">
import { Color } from "@/lib/utils/color";
import floatView from "@/components/properties/PropFloat.vue";
import boolView from "@/components/properties/PropBool.vue";
import enumView from "@/components/properties/PropEnum.vue";
import imageView from "@/components/properties/PropImage.vue"
import colorView from "@/components/properties/PropColor.vue";
import textureChannel from "@/components/properties/PropTextureChannel.vue";
import RandomSeedPropertyView from "@/components/properties/PropRandomSeed.vue";
import stringView from "@/components/properties/PropString.vue";
import {
  IProperyUi,
  PropertyChangeComplete
} from "../components/properties/i-property-ui";
import {
  Property,
  IPropertyHolder,
  PropertyGroup
} from "@/lib/node/node-property";
import { BaseNode } from "@/lib/node/base-node";
import { useMainStore } from '@/store/index';
import {
  FloatProperty,
  IntProperty,
  BoolProperty,
  EnumProperty,
  StringProperty,
  ColorProperty,
  PropertyType,
  ImageProperty
} from "@/lib/node/node-property";
import { storeToRefs } from 'pinia';
import {computed, onMounted} from "vue";
import {getCurrentInstance} from "vue";


let store=useMainStore();
// let properties=store.properties;

const addProperty=()=>{
  store.property.push(new StringProperty("test","test","",true));
  console.log("属性",store.property);
}
//测试用

const { focusedNode, property } = storeToRefs(store);
const properties = computed(() => { return property.value; })
// const testProperty=properties.value;
// testProperty.push(new ImageProperty("test","test",""));
class PropHolder {
  prop: Property;
  componentName: string;
}
const componentMap={
  "floatView":floatView,
  "boolView":boolView,
  "intView":floatView,
  "enumView":enumView,
  "stringView":stringView,
  "colorView":colorView,
  "imageView":imageView
};

let prop: PropHolder[]=properties.value.map(prop =>{
  return {
    prop:prop,
    componentName:componentMap[prop.type+"View"]
  }
})
// let prop: PropHolder[]=testProperty.map(prop =>{
//   return {
//     prop:prop,
//     componentName:componentMap[prop.type+"View"]
//   }
// })
</script>
