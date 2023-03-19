<template>
    <div class="field">
        <label>{{ property.displayName }}</label>
        <el-button @click="updateBoolProperty">{{ boolValue }}</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { useMainStore } from "@/store";
import { BoolProperty } from "@/lib/node/node-property";

const props = defineProps<{ prop: BoolProperty }>();
const property = props.prop;
const boolValue = ref(property.getValue());

const store = useMainStore();

const updateBoolProperty = () => {
    boolValue.value = !boolValue.value;
    store.updatePropertyByName(property.name, boolValue.value);
    console.log("BoolView.vue: update bool property: ", boolValue.value);
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
