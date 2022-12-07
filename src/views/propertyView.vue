<template>
  <component
      v-for="(p, index) in this.prop"
      :is="p.componentName"
      :prop="p.prop"
      :key="index"
  ></component>



<!--  <button @click="addProperty">添加</button>-->
<!--  <div>{{properties}}</div>-->
  <div>propertyView</div>

</template>

<script  setup lang="ts">
import { Color } from "@/lib/designer/color";
import floatView from "@/components/properties/PropFloat.vue";
import boolView from "@/components/properties/PropBool.vue";
import enumView from "@/components/properties/PropEnum.vue";

import colorView from "@/components/properties/PropColor.vue";
import textureChannel from "@/components/properties/PropTextureChannel.vue";
import RandomSeedPropertyView from "@/components/properties/PropRandomSeed.vue";
import stringView from "@/components/properties/PropString.vue";
import {
  IProperyUi,
  PropertyChangeComplete
} from "../components/properties/ipropertyui";
import {
  Property,
  IPropertyHolder,
  PropertyGroup
} from "@/lib/designer/properties";
import {Node} from "@/lib/node/Node";
import { useMainStore } from '@/store/index';
import {
  FloatProperty,
  IntProperty,
  BoolProperty,
  EnumProperty,
  StringProperty,
  ColorProperty,
  PropertyType,
} from "@/lib/node/NodeProperty";
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
  "colorView":colorView
};

let prop: PropHolder[]=properties.value.map(prop =>{
  return {
    prop:prop,
    componentName:componentMap[prop.type+"View"]
  }
})
console.log(properties);


</script>
