<template>
  <p></p>
  <p></p>
  <p></p>
  <div class="field">
    <label>{{ prop.displayName }}</label>
    <label>TEST</label>
    <div>
      <button class="bool" @click="toggleValue()">
        {{ val ? "True" : "False" }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Emit, Model } from "vue-property-decorator";
import { Vue } from 'vue-class-component'
import { IPropertyHolder } from "../../lib/designer/properties";
import { PropertyChangeComplete } from "./ipropertyui";


export default class BoolPropertyView extends Vue {
  @Prop()
      // BoolProperty
  prop: any;

  // @Prop()
  // designer: Designer;

  @Prop()
  propHolder: IPropertyHolder;

  val: boolean = false;

  @Emit()
  propertyChanged() {
    return this.prop.name;
  }

  @Emit()
  propertyChangeCompleted(evt: PropertyChangeComplete) {
    return evt;
  }


  mounted() {
  }

  toggleValue() {
    this.val=!this.val;
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
