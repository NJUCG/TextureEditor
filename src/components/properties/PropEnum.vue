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

<script lang="ts">
import { Prop, Component, Emit } from "vue-property-decorator";
import {Vue} from"vue-class-component";
import { IPropertyHolder } from "@/lib/designer/properties";



export default class EnumPropertyView extends Vue {
  @Prop()
      // EnumProperty
  prop: any;

  // @Prop()
  // designer: Designer;

  @Prop()
  propHolder: IPropertyHolder;

  enumIndex: number = 0;

  @Emit()
  propertyChanged() {
    return this.prop.name;
  }

  mounted() {
    this.enumIndex = this.prop.index;
  }

  updateValue(evt) {
    console.log("修改index为"+evt.target.options.selectedIndex);
  }


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
