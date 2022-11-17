<template>
  <component
      v-for="(p, index) in this.prop"
      :is="p.componentName"
      :prop="p.prop"
      :key="index"
  ></component>
  <div>propertyView</div>
</template>

<script  setup lang="ts">
import {Vue} from "vue-class-component";
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
let store=useMainStore();
// let properties=store.properties;
let properties:Property[]=[];
const property1=new IntProperty("test","test",1,1);
const property2=new BoolProperty("testbool","testbool",true);
const property3=new EnumProperty("teste","teste",["1","2","3"],0);
const property4=new StringProperty("tests","tests","",true);
const defaultColor =new Color(0,0,1,1);
const property5=new ColorProperty("testColor","testColor",defaultColor);
properties.push(property1);
properties.push(property2);
properties.push(property3);
properties.push(property4);
properties.push(property5);
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

let prop: PropHolder[]=properties.map(prop =>{
  return {
    prop:prop,
    componentName:componentMap[prop.type+"View"]
  }
})
console.log(properties);

</script>
