<template>
  <div class="field">
    <label>{{ prop.displayName }}</label>
    <div>
      <color-picker
          :key="key"
          :color="val"
          @input="onInput"
          @change="onValue"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Emit } from "vue-property-decorator";
import {Vue} from"vue-class-component"
import { IPropertyHolder } from "@/lib/designer/properties";

// import ColorPicker from "@/components/ColorPicker.vue";
//需要定义一个colorpicker组件(未完成)

export default class ColorPropertyView extends Vue {
  @Prop()
  prop: any;

  oldValue: string;
  val: string = "#000000";
  key: number = 0;


  @Prop()
  propHolder: IPropertyHolder;

  public ColorPropertyView() {}

  mounted() {
    this.oldValue = this.prop.value.toHex();
    this.val = this.prop.value.toHex();
    this.key += 1;
  }


//用户从colorpicker中选取颜色后需要进行的操作
  onInput(value) {

  }
//用户改变选取颜色后需要进行的操作
  onValue(value) {

  }

}
</script>

<style scoped>

</style>
