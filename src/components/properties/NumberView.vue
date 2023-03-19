<template>
    <div class="field">
        <label>{{ property.displayName }}</label>
        <el-slider
            v-model="floatValue"
            :min="property.minValue"
            :max="property.maxValue"
            :step="property.step"
            @input="updateNumberProperty"
            show-input 
        >
        </el-slider>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { FloatProperty, IntProperty } from "@/lib/node/node-property";
import { useMainStore } from "@/store";

const props = defineProps<{ prop: FloatProperty | IntProperty }>();
const property = props.prop;
const floatValue = ref(property.getValue());

const store = useMainStore();

const updateNumberProperty = (value: number) => {
    store.updatePropertyByName(property.name, value);
    console.log("NumberView.vue: update number property: ", value);
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

</style>
